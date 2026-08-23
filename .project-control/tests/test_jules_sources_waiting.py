import json
import unittest

from jules_client import HttpResponseError, JulesClient
from jules_reconciliation import build_source_index, reconcile, session_repository
from jules_shadow_cycle import _latest_waiting_question


class FakeTransport:
    def __init__(self, steps):
        self.steps = list(steps)
    def __call__(self, method, url, headers, body, timeout):
        step = self.steps.pop(0)
        if isinstance(step, Exception):
            raise step
        status, response_headers, payload = step
        raw = payload if isinstance(payload, bytes) else json.dumps(payload).encode()
        if status >= 400:
            raise HttpResponseError(status, response_headers, raw)
        return status, response_headers, raw


class JulesSourcesWaitingTests(unittest.TestCase):
    def test_sources_endpoint_maps_exact_repository(self):
        source = {"name":"sources/github-hamad933-GS-2","id":"github-hamad933-GS-2","githubRepo":{"owner":"hamad933","repo":"GS-2"}}
        client = JulesClient(api_key="dummy", transport=FakeTransport([(200, {}, {"sources":[source]})]))
        result = client.list_sources()
        self.assertTrue(result.ok)
        index = build_source_index(result.payload["sources"])
        session = {"id":"1","state":"IN_PROGRESS","sourceContext":{"source":source["name"],"githubRepoContext":{"startingBranch":"work"}}}
        self.assertEqual(session_repository(session, index), "hamad933/GS-2")

    def test_source_protocol_drift_fails_closed(self):
        client = JulesClient(api_key="dummy", transport=FakeTransport([(200, {}, {"sources":[{"name":"sources/future"}]})]))
        self.assertEqual(client.list_sources().classification, "JULES_API_PROTOCOL_CHANGED")

    def test_repository_plus_task_id_strengthens_mapping_but_remains_proposed(self):
        source = {"name":"sources/github-hamad933-GS-2","githubRepo":{"owner":"hamad933","repo":"GS-2"}}
        session = {"id":"8151804665897815512","state":"AWAITING_USER_FEEDBACK","sourceContext":{"source":source["name"],"githubRepoContext":{"startingBranch":"main"}}}
        config = {"repository":"hamad933/GS-2","reviewer_a":[{"page":"START","task_id":"8151804665897815512","session_id":None}],"writer_lineages":{}}
        result = reconcile(config, [session], [source])
        mapping = result["mappings"][0]
        self.assertEqual(mapping["status"], "PROPOSED_UNVERIFIED")
        self.assertEqual(mapping["session"]["repository"], "hamad933/GS-2")

    def test_latest_agent_question_is_retrieved_from_activity_context(self):
        activities = [
            {"id":"a1","originator":"agent","createTime":"2026-08-23T01:00:00Z","agentMessaged":{"agentMessage":"older"}},
            {"id":"a2","originator":"user","createTime":"2026-08-23T01:01:00Z","userMessaged":{"userMessage":"reply"}},
            {"id":"a3","originator":"agent","createTime":"2026-08-23T01:02:00Z","agentMessaged":{"agentMessage":"current question"}},
        ]
        result = _latest_waiting_question(activities)
        self.assertEqual(result["activity_id"], "a3")
        self.assertEqual(result["question_text"], "current question")

    def test_activity_pagination_is_bounded(self):
        client = JulesClient(api_key="dummy", transport=FakeTransport([
            (200, {}, {"activities":[{"id":"a1"}],"nextPageToken":"next"}),
            (200, {}, {"activities":[{"id":"a2"}]})
        ]))
        result = client.list_all_activities("session-1", max_pages=2)
        self.assertTrue(result.ok)
        self.assertEqual([x["id"] for x in result.payload["activities"]], ["a1","a2"])


if __name__ == "__main__":
    unittest.main()
