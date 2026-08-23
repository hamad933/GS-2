import unittest
from state_matcher import *

CAND="22766701b74ab25e2f62e74ea35d1bf054fa4dee"

class Matrix(unittest.TestCase):
    def test_01_active_writer_no_duplicate(self):
        self.assertEqual(new_task_gate(proven_used=5,unverified_preexisting=False,requested_role="writer").action,"REUSE_EXISTING_LINEAGE")
    def test_02_safe_waiting_same_session(self):
        self.assertEqual(waiting_decision({"within_authorized_scope":True,"head_valid":True,"policy_fact_proven":True}).action,"CONTINUE_EXISTING_SESSION_WITH_SAFE_ANSWER")
    def test_03_authority_wait_escalate(self):
        self.assertTrue(waiting_decision({"authority_action":"merge"}).escalation)
    def test_04_context_exhaustion_proven(self):
        self.assertTrue(context_replacement_allowed({"executor_explicit_limit":True}))
    def test_05_long_not_exhausted(self):
        self.assertFalse(context_replacement_allowed({"large":True,"many_files":True}))
    def test_06_owned_failure_same_writer(self):
        self.assertEqual(normalize_ci("failure",failure_owner="workstream"),CIState.WORKSTREAM_OWNED_FAILURE)
    def test_07_transient_ci(self):
        self.assertEqual(normalize_ci("failure",failure_owner="transient"),CIState.EXTERNAL_TRANSIENT_FAILURE)
    def test_08_artifact_mismatch(self):
        self.assertEqual(normalize_ci("success",run_sha=CAND,expected_sha=CAND,artifact_sha="x"),CIState.ARTIFACT_LINEAGE_MISMATCH)
    def test_09_success_candidate_reviewer_a(self):
        self.assertEqual(normalize_ci("success",run_sha=CAND,expected_sha=CAND),CIState.SUCCESS)
    def test_10_a_revision_same_writer(self):
        d=review_decision(verdict="REVISION_REQUIRED",reviewed_sha=CAND,candidate_sha=CAND)
        self.assertEqual(d.action,"ROUTE_GROUPED_FINDINGS_TO_EXISTING_WRITER")
    def test_11_a_pass_b_required(self):
        a=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND)
        self.assertEqual(double_assurance(a,None,a_sha=CAND,b_sha=None,candidate_sha=CAND).state,ReviewState.DOUBLE_ASSURANCE_REQUIRED)
    def test_12_b_pass_parent(self):
        a=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND)
        b=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND)
        self.assertEqual(double_assurance(a,b,a_sha=CAND,b_sha=CAND,candidate_sha=CAND).state,ReviewState.DOUBLE_ASSURANCE_PASS_PENDING_PARENT_REVIEW)
    def test_13_b_defects(self):
        a=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND)
        b=review_decision(verdict="REVISION_REQUIRED",reviewed_sha=CAND,candidate_sha=CAND)
        self.assertEqual(double_assurance(a,b,a_sha=CAND,b_sha=CAND,candidate_sha=CAND).state,ReviewState.REVIEW_DISAGREEMENT_REQUIRES_ADJUDICATION)
    def test_14_sha_mismatch(self):
        a=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND)
        b=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND)
        self.assertEqual(double_assurance(a,b,a_sha=CAND,b_sha="old",candidate_sha=CAND).state,ReviewState.STALE_REVIEW)
    def test_15_new_sha_invalidates_old(self):
        self.assertEqual(review_decision(verdict="PASS",reviewed_sha="old",candidate_sha=CAND).state,ReviewState.STALE_REVIEW)
    def test_16_reviewer_mutation(self):
        self.assertEqual(review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND,reviewer_changed_paths=["x"]).state,ReviewState.REVIEWER_MUTATION_DETECTED)
    def test_17_scope_mismatch(self):
        self.assertEqual(review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND,scope_match=False).state,ReviewState.REVIEW_SCOPE_MISMATCH)
    def test_18_operation_key_idempotent(self):
        k1=operation_key(repo="r",workstream="w",role="x",task_session="1",pr=2,head_sha=CAND,normalized_input={"a":1},action_type="msg")
        k2=operation_key(repo="r",workstream="w",role="x",task_session="1",pr=2,head_sha=CAND,normalized_input={"a":1},action_type="msg")
        self.assertEqual(k1,k2)
    def test_19_unknown_write_read_poststate(self):
        self.assertEqual(waiting_decision({"write_claimed":True,"write_visible":False}).action,"READ_AUTHORITATIVE_POST_STATE_BEFORE_RETRY")
    def test_20_base_drift(self):
        self.assertEqual(workstream_safety({"base_sha":"a","registered_base_sha":"b"}).state,WorkstreamState.BASELINE_DRIFT)
    def test_21_head_drift(self):
        self.assertEqual(workstream_safety({"head_sha":"a","registered_head_sha":"b"}).state,WorkstreamState.HEAD_DRIFT)
    def test_22_shared_collision(self):
        self.assertTrue(workstream_safety({"shared_path_collision":True}).escalation)
    def test_23_non_draft_flag(self):
        self.assertEqual(workstream_safety({"pr_non_draft":True,"non_draft_authorized":False}).state,WorkstreamState.CANDIDATE_NON_DRAFT_UNAUTHORIZED)
    def test_24_merged_escalate(self):
        self.assertTrue(workstream_safety({"pr_merged":True}).escalation)
    def test_25_warning_zone(self):
        self.assertIn("WARNING",new_task_gate(proven_used=20,unverified_preexisting=False,requested_role="B",independent_assurance_justified=True).state)
    def test_26_reserve_zone(self):
        self.assertIn("RESERVE",new_task_gate(proven_used=24,unverified_preexisting=False,requested_role="B",independent_assurance_justified=True).state)
    def test_27_budget_30_stop(self):
        self.assertEqual(new_task_gate(proven_used=30,unverified_preexisting=False,requested_role="B").state,"TASK_BUDGET_HARD_STOP")
    def test_28_unknown_history_no_creation(self):
        self.assertEqual(new_task_gate(proven_used=5,unverified_preexisting=True,requested_role="B",independent_assurance_justified=True).state,"TASK_BUDGET_UNCERTAIN")
    def test_29_completed_but_continuation_available_reuse(self):
        self.assertFalse(context_replacement_allowed({"session_terminal_no_continuation":False,"continuation_unavailable":False}))
    def test_30_old_continuation_impossible(self):
        self.assertTrue(context_replacement_allowed({"continuation_unavailable":True}))
    def test_31_independent_pages_key_isolated(self):
        a=operation_key(repo="r",workstream="HOME",role="A",task_session="1",pr=1,head_sha=CAND,normalized_input={},action_type="review")
        b=operation_key(repo="r",workstream="START",role="A",task_session="2",pr=2,head_sha=CAND,normalized_input={},action_type="review")
        self.assertNotEqual(a,b)
    def test_32_blocked_page_does_not_make_other_unknown(self):
        self.assertFalse(workstream_safety({}).escalation)
    def test_33_pass_without_binding_not_accepted(self):
        self.assertEqual(review_decision(verdict="PASS",reviewed_sha=None,candidate_sha=CAND,binding_proven=False).state,ReviewState.NOT_VERIFIABLE)
    def test_34_ci_green_not_visual_acceptance(self):
        self.assertEqual(normalize_ci("success"),CIState.SUCCESS)
        self.assertNotEqual(review_decision(verdict=None,reviewed_sha=CAND,candidate_sha=CAND).state,ReviewState.PASS_FOR_PARENT_REVIEW)
    def test_35_unknown_future_state_escalates(self):
        undocumented=("CANCELLED","CANCELED","RUNNING","WAITING_FOR_USER","WAITING_FOR_FEEDBACK","DONE","ERROR")
        for raw in undocumented:
            with self.subTest(raw=raw):
                self.assertEqual(normalize_jules(raw),JulesState.UNKNOWN_JULES_STATE)
        self.assertEqual(normalize_jules("FUTURE_WEIRD"),JulesState.UNKNOWN_JULES_STATE)
        self.assertEqual(normalize_ci("FUTURE_WEIRD"),CIState.UNKNOWN_CI_STATE)
    def test_36_matcher_weakness_is_not_self_modification(self):
        d=waiting_decision({"unexpected_new_condition":True})
        self.assertEqual(d.action,"ESCALATE_NO_GUESS")

class ProjectSpecific(unittest.TestCase):
    def test_37_readonly_reviewer_code_bearing_pr(self):
        d=review_decision(verdict="PASS",reviewed_sha=CAND,candidate_sha=CAND,reviewer_opened_code_pr=True)
        self.assertEqual(d.state,ReviewState.REVIEWER_MUTATION_DETECTED)
    def test_38_source_binding_failed_does_not_create_b(self):
        a=review_decision(verdict="SOURCE_BINDING_FAILED",reviewed_sha=None,candidate_sha=CAND,binding_proven=False)
        self.assertEqual(double_assurance(a,None,a_sha=None,b_sha=None,candidate_sha=CAND).action,"NO_REVIEWER_B_YET")
    def test_39_candidate_no_ci_run(self):
        self.assertEqual(normalize_ci(None,expected_sha=CAND),CIState.NO_RUN)
    def test_40_provider_history_unknown_freezes_b(self):
        d=new_task_gate(proven_used=5,unverified_preexisting=True,requested_role="REVIEWER_B",independent_assurance_justified=True)
        self.assertEqual(d.action,"DENY_NEW_TASK_UNTIL_HISTORY_RESOLVED")
    def test_41_start_task_remains_independent_when_other_pages_invalid(self):
        self.assertEqual(normalize_jules("in progress"),JulesState.IN_PROGRESS)
    def test_42_scope_violation_fails_closed(self):
        self.assertTrue(workstream_safety({"changed_outside_scope":True}).escalation)

if __name__=="__main__":
    unittest.main()
