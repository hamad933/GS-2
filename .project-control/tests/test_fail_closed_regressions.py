import unittest

from fast_live_cycle import _classify_candidate_ci, run as fast_run
from github_live_snapshot import GitHubReadOnly
from jules_reconciliation import reconcile

CAND = "22766701b74ab25e2f62e74ea35d1bf054fa4dee"
BASE = "e00aa750fa90fd55bc26c31e73d632592f5727bd"


class SequenceGitHub(GitHubReadOnly):
    def __init__(self, pages):
        super().__init__("hamad933/GS-2", token="dummy")
        self.pages = list(pages)

    def get(self, path, params=None):
        return self.pages.pop(0)


class FailClosedRegressionTests(unittest.TestCase):
    def test_status_only_success_requires_explicit_success(self):
        cand = {
            "live_head_sha": CAND,
            "workflow_runs": [],
            "statuses": [{"state": "success", "sha": CAND}],
        }
        self.assertEqual(_classify_candidate_ci(cand), "SUCCESS")

    def test_status_only_failure_never_becomes_success_from_all_empty(self):
        cand = {
            "live_head_sha": CAND,
            "workflow_runs": [],
            "statuses": [{"state": "failure", "sha": CAND}],
        }
        self.assertEqual(_classify_candidate_ci(cand), "FAILURE")

    def test_mixed_successful_run_and_failing_status_fails(self):
        cand = {
            "live_head_sha": CAND,
            "workflow_runs": [{"head_sha": CAND, "status": "completed", "conclusion": "success"}],
            "statuses": [{"state": "failure", "sha": CAND}],
        }
        self.assertEqual(_classify_candidate_ci(cand), "FAILURE")

    def test_no_evidence_is_no_run(self):
        self.assertEqual(
            _classify_candidate_ci({"live_head_sha": CAND, "workflow_runs": [], "statuses": []}),
            "NO_RUN",
        )

    def test_candidate_base_drift_fails_closed(self):
        snapshot = {
            "repository": "hamad933/GS-2",
            "candidate": {
                "registered_sha": CAND,
                "registered_branch": "candidate",
                "registered_base_sha": BASE,
                "registered_base_ref": "integration",
                "pr": 88,
                "live_head_sha": CAND,
                "live_head_ref": "candidate",
                "live_base_sha": "moved-base",
                "live_base_ref": "integration",
                "draft": True,
                "state": "open",
                "merged": False,
                "workflow_runs": [],
                "statuses": [],
            },
            "reviewer_a": [],
        }
        policy = {"proven_used": 5, "unverified_preexisting": True}
        receipt = fast_run(snapshot, policy)["receipts"][0]
        self.assertEqual(receipt["state"], "BASELINE_DRIFT")
        self.assertEqual(receipt["action"], "FAIL_CLOSED")

    def test_explicit_session_repository_mismatch_is_not_bound(self):
        gs_source = {"name": "sources/gs", "githubRepo": {"owner": "hamad933", "repo": "GS-2"}}
        other_source = {"name": "sources/other", "githubRepo": {"owner": "hamad933", "repo": "Other"}}
        session = {
            "id": "123",
            "state": "IN_PROGRESS",
            "sourceContext": {"source": "sources/other", "githubRepoContext": {}},
        }
        config = {
            "repository": "hamad933/GS-2",
            "reviewer_a": [{"page": "HOME", "task_id": "123", "session_id": "123"}],
            "writer_lineages": {},
        }
        mapping = reconcile(config, [session], [gs_source, other_source])["mappings"][0]
        self.assertEqual(mapping["status"], "EXPLICIT_SESSION_REPOSITORY_MISMATCH")

    def test_explicit_session_without_resolvable_source_is_not_bound(self):
        session = {"id": "123", "state": "IN_PROGRESS", "sourceContext": {"source": "sources/missing"}}
        config = {
            "repository": "hamad933/GS-2",
            "reviewer_a": [{"page": "HOME", "task_id": "123", "session_id": "123"}],
            "writer_lineages": {},
        }
        mapping = reconcile(config, [session], [])["mappings"][0]
        self.assertEqual(mapping["status"], "EXPLICIT_SESSION_SOURCE_UNVERIFIED")

    def test_gitHub_pagination_collects_beyond_first_page(self):
        first = [{"id": i} for i in range(100)]
        second = [{"id": 100}]
        gh = SequenceGitHub([first, second])
        items = gh.get_all("/x", max_pages=3)
        self.assertEqual(len(items), 101)
        self.assertEqual(items[-1]["id"], 100)

    def test_pagination_limit_refuses_partial_inventory(self):
        gh = SequenceGitHub([[{"id": i} for i in range(100)]])
        with self.assertRaises(RuntimeError):
            gh.get_all("/x", max_pages=1)


if __name__ == "__main__":
    unittest.main()
