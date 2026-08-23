import io
import json
import os
import tempfile
import unittest
from contextlib import redirect_stdout, redirect_stderr
from pathlib import Path
from unittest.mock import patch

from jules_client import HttpResponseError, JulesClient, TransportError, continuation_policy_for_state, normalize_session_state, sanitize
from jules_existing_session import ExistingSessionJulesClient
from jules_reconciliation import reconcile
from jules_routing import reviewer_to_writer, waiting_route, writer_to_reviewer
from jules_shadow_cycle import run as shadow_run
from operation_safety import CircuitBreaker, MutationLease, MutationReceipt, ReceiptStore


class FakeTransport:
    def __init__(self, steps):
        self.steps = list(steps)
        self.calls = []
    def __call__(self, method, url, headers, body, timeout):
        self.calls.append((method, url, dict(headers), body, timeout))
        step = self.steps.pop(0)
        if isinstance(step, Exception):
            raise step
        status, resp_headers, payload = step
        raw = payload if isinstance(payload, bytes) else json.dumps(payload).encode()
        if status >= 400:
            raise HttpResponseError(status, resp_headers, raw)
        return status, resp_headers, raw


def client_with(steps, **kwargs):
    sleeper = kwargs.pop("sleeper", lambda _: None)
    jitter = kwargs.pop("jitter", lambda: 0.0)
    return JulesClient(api_key="dummy-secret", transport=FakeTransport(steps), sleeper=sleeper, jitter=jitter, **kwargs)


class JulesApiControlTests(unittest.TestCase):
    def test_01_secret_unavailable_degraded_github_only(self):
        with patch.dict(os.environ, {}, clear=True):
            result = shadow_run({"reviewer_a": [], "writer_lineages": {}})
        self.assertEqual(result["capability_state"], "JULES_API_SECRET_MISSING")
        self.assertEqual(result["control_mode"], "DEGRADED_GITHUB_ONLY")
        self.assertFalse(result["jules_mutations_enabled"])

    def test_02_valid_credential_read_probe(self):
        result = client_with([(200, {}, {"sessions": [], "nextPageToken": ""})]).probe()
        self.assertTrue(result.ok)
        self.assertEqual(result.classification, "JULES_API_READY")

    def test_03_401(self):
        self.assertEqual(client_with([HttpResponseError(401, {}, b'{"error":{}}')]).probe().classification, "JULES_API_UNAUTHORIZED")

    def test_04_403(self):
        self.assertEqual(client_with([HttpResponseError(403, {}, b'{"error":{}}')]).probe().classification, "JULES_API_FORBIDDEN")

    def test_05_429_retry_after(self):
        sleeps = []
        client = client_with([HttpResponseError(429, {"Retry-After": "3"}, b'{"error":{}}'), (200, {}, {"sessions": []})], sleeper=sleeps.append)
        self.assertTrue(client.list_sessions(page_size=1).ok)
        self.assertEqual(sleeps, [3.0])

    def test_06_5xx_bounded_read_retry(self):
        sleeps = []
        client = client_with([HttpResponseError(503, {}, b'{"error":{}}')] * 3, sleeper=sleeps.append, max_read_attempts=3)
        result = client.list_sessions()
        self.assertEqual(result.classification, "JULES_API_PROVIDER_UNAVAILABLE")
        self.assertEqual(len(sleeps), 2)

    def test_07_malformed_provider_response(self):
        self.assertEqual(client_with([(200, {}, b'not-json')]).list_sessions().classification, "JULES_API_RESPONSE_INVALID")

    def test_08_unknown_jules_state(self):
        self.assertEqual(normalize_session_state("FUTURE_MAGIC_STATE"), "UNKNOWN_JULES_STATE")
        self.assertEqual(continuation_policy_for_state("FUTURE_MAGIC_STATE"), "UNKNOWN_JULES_STATE")

    def test_09_active_writer_reuse(self):
        decision = waiting_route(waiting_class="POLICY_RESOLVABLE", session_state="IN_PROGRESS", session_bound=True, receipt_exists=False, action_in_flight=False)
        self.assertEqual(decision.action, "SEND_MESSAGE_EXISTING_SESSION")

    def test_10_awaiting_feedback_safe_response(self):
        transport = FakeTransport([(200, {}, {})])
        client = JulesClient(api_key="dummy-secret", transport=transport)
        result = client.send_message("123", "continue within scope", known_state="AWAITING_USER_FEEDBACK", mutation_authorized=True)
        self.assertTrue(result.ok)
        self.assertEqual(transport.calls[0][0], "POST")

    def test_11_authority_bearing_waiting_question(self):
        decision = waiting_route(waiting_class="OWNER_OR_CONTROLLER_AUTHORITY_REQUIRED", session_state="AWAITING_USER_FEEDBACK", session_bound=True, receipt_exists=False, action_in_flight=False)
        self.assertTrue(decision.escalation)
        self.assertEqual(decision.action, "PARENT_CONTROLLER")

    def test_12_same_correction_already_in_progress(self):
        decision = reviewer_to_writer(repo="hamad933/GS-2", workstream="SOLUTIONS", review_packet={"candidate_sha":"abc","scope_match":True,"findings":[{"id":"F1"}]}, current_pr_sha="abc", writer_session_id="w1", writer_binding_status="BOUND_CONFIRMED", writer_pr=85, writer_head_sha="def", receipt_exists=False, action_in_flight=True)
        self.assertEqual(decision.action, "NO_ACTION")

    def test_13_ambiguous_session_ownership(self):
        config = {"reviewer_a":[{"page":"A","task_id":"42","session_id":None},{"page":"B","task_id":"42","session_id":None}],"writer_lineages":{}}
        self.assertTrue(reconcile(config, [{"id":"42","state":"IN_PROGRESS"}])["ambiguous"])

    def test_14_exact_sha_reviewer_routing(self):
        decision = reviewer_to_writer(repo="hamad933/GS-2", workstream="HOME", review_packet={"candidate_sha":"abc","scope_match":True,"reviewer_mutation":False,"findings":[{"id":"H1"}]}, current_pr_sha="abc", writer_session_id="w1", writer_binding_status="BOUND_EXPLICIT", writer_pr=82, writer_head_sha="def", receipt_exists=False, action_in_flight=False)
        self.assertEqual(decision.action, "SEND_ONE_GROUPED_CORRECTION_PACKET")
        self.assertTrue(decision.operation_key)

    def test_15_stale_reviewer_sha_rejected(self):
        decision = reviewer_to_writer(repo="x/y", workstream="HOME", review_packet={"candidate_sha":"old"}, current_pr_sha="new", writer_session_id="w", writer_binding_status="BOUND_EXPLICIT", writer_pr=1, writer_head_sha="h", receipt_exists=False, action_in_flight=False)
        self.assertEqual(decision.state, "STALE_REVIEW")

    def test_16_duplicate_send_message_prevented(self):
        with tempfile.TemporaryDirectory() as td:
            store = ReceiptStore(Path(td) / "r.json")
            receipt = MutationReceipt("op1", 1.0, "s1", "sha", "sendMessage", "success")
            store.append(receipt); store.append(receipt)
            self.assertEqual(len(store.load()), 1)
            self.assertTrue(store.contains("op1"))

    def test_17_ambiguous_send_message_requires_post_state(self):
        result = client_with([TransportError("timeout")]).send_message("123", "safe", known_state="IN_PROGRESS", mutation_authorized=True)
        self.assertEqual(result.classification, "WRITE_OUTCOME_UNKNOWN")

    def test_18_completed_session_continuation_unavailable(self):
        result = client_with([]).send_message("123", "safe", known_state="COMPLETED", mutation_authorized=True)
        self.assertEqual(result.classification, "SESSION_CONTINUATION_UNAVAILABLE")

    def test_19_new_task_recommendation_without_creation(self):
        decision = writer_to_reviewer(repo="x/y", workstream="HOME", candidate={"branch":"b","pr":1,"head_sha":"abc","ci_state":"SUCCESS"}, expected_branch="b", expected_pr=1, reviewer_session_id=None, reviewer_binding_status="NO_MATCH", reviewer_continuation_available=False, receipt_exists=False, action_in_flight=False)
        self.assertEqual(decision.action, "NEW_TASK_RECOMMENDED")

    def test_20_reviewer_to_writer_round_trip(self):
        first = reviewer_to_writer(repo="x/y", workstream="HOME", review_packet={"candidate_sha":"abc","findings":[{"id":"H1"}]}, current_pr_sha="abc", writer_session_id="writer", writer_binding_status="BOUND_CONFIRMED", writer_pr=2, writer_head_sha="wsha", receipt_exists=False, action_in_flight=False)
        self.assertEqual(first.state, "CORRECTION_PENDING")
        second = reviewer_to_writer(repo="x/y", workstream="HOME", review_packet={"candidate_sha":"abc","findings":[{"id":"H1"}]}, current_pr_sha="abc", writer_session_id="writer", writer_binding_status="BOUND_CONFIRMED", writer_pr=2, writer_head_sha="wsha", receipt_exists=True, action_in_flight=False)
        self.assertEqual(second.action, "NO_ACTION")

    def test_21_writer_to_reviewer_round_trip(self):
        decision = writer_to_reviewer(repo="x/y", workstream="HOME", candidate={"branch":"b","pr":1,"head_sha":"new","ci_state":"SUCCESS"}, expected_branch="b", expected_pr=1, reviewer_session_id="reviewer", reviewer_binding_status="BOUND_CONFIRMED", reviewer_continuation_available=True, receipt_exists=False, action_in_flight=False)
        self.assertEqual(decision.action, "SEND_REREVIEW_EXISTING_SESSION")
        self.assertTrue(decision.operation_key)

    def test_22_concurrent_workflow_race(self):
        with tempfile.TemporaryDirectory() as td:
            a = MutationLease(td, "HOME"); b = MutationLease(td, "HOME")
            self.assertTrue(a.acquire()); self.assertFalse(b.acquire()); a.release(); self.assertTrue(b.acquire()); b.release()

    def test_23_secret_not_present_in_logs(self):
        secret = "SUPER-SECRET-VALUE"
        rendered = json.dumps(sanitize({"apiKey": secret, "prompt": secret, "nested":{"authorization":secret}, "id":"1"}))
        self.assertNotIn(secret, rendered)
        transport = FakeTransport([(200, {}, {"sessions": []})])
        buf = io.StringIO()
        with redirect_stdout(buf), redirect_stderr(buf):
            JulesClient(api_key=secret, transport=transport).probe()
        self.assertNotIn(secret, buf.getvalue())

    def test_24_untrusted_pr_code_cannot_access_secret(self):
        workflow = Path(os.environ["GS_TEST_WORKFLOW"]).read_text()
        self.assertIn("github.event_name == 'push'", workflow)
        self.assertIn("refs/heads/automation/gs-two-tier-control-v1", workflow)
        self.assertNotIn("pull_request_target", workflow)
        secret_index = workflow.index("JULES_API_KEY: ${{ secrets.JULES_API_KEY }}")
        self.assertGreaterEqual(workflow.rfind("if:", 0, secret_index), 0)

    def test_25_provider_outage_leaves_github_control_operational(self):
        breaker = CircuitBreaker(threshold=2)
        breaker.record("JULES_API_PROVIDER_UNAVAILABLE"); self.assertFalse(breaker.open)
        breaker.record("JULES_API_PROVIDER_UNAVAILABLE"); self.assertTrue(breaker.open)

    def test_26_task_budget_not_bypassed(self):
        client = client_with([])
        self.assertEqual(client.create_session({"prompt":"x"}, parent_authorized=False, budget_gate="ALLOW").classification, "NEW_TASK_CREATION_NOT_AUTHORIZED")
        self.assertEqual(client.create_session({"prompt":"x"}, parent_authorized=True, budget_gate="DENY").classification, "NEW_TASK_CREATION_NOT_AUTHORIZED")

    def test_27_contract_version_drift_fails_closed(self):
        result = client_with([(200, {}, {"sessions":[{"id":"1","futureState":"RUNNING"}]})]).list_sessions()
        self.assertEqual(result.classification, "JULES_API_PROTOCOL_CHANGED")

    def test_project_specific_task_id_exact_match_is_proposed_not_auto_bound(self):
        config = {"reviewer_a":[{"page":"START","task_id":"8151804665897815512","session_id":None}],"writer_lineages":{}}
        result = reconcile(config, [{"id":"8151804665897815512","state":"AWAITING_USER_FEEDBACK"}])
        self.assertEqual(result["mappings"][0]["status"], "PROPOSED_UNVERIFIED")

    def test_project_specific_reviewer_mutation_blocks_writer_route(self):
        decision = reviewer_to_writer(repo="x/y", workstream="SOLUTIONS", review_packet={"candidate_sha":"abc","reviewer_mutation":True}, current_pr_sha="abc", writer_session_id="w", writer_binding_status="BOUND_CONFIRMED", writer_pr=85, writer_head_sha="h", receipt_exists=False, action_in_flight=False)
        self.assertEqual(decision.state, "REVIEWER_MUTATION_DETECTED")


class ExistingSessionCompatibilityTests(unittest.TestCase):
    def test_no_create_session_surface(self):
        client = ExistingSessionJulesClient(api_key="x", transport=FakeTransport([]))
        self.assertFalse(hasattr(client, "create_session"))


if __name__ == "__main__":
    unittest.main()
