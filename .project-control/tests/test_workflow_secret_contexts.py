import os
import unittest
from pathlib import Path


class WorkflowSecretContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow = Path(os.environ["GS_TEST_WORKFLOW"]).read_text(encoding="utf-8")

    def test_secret_pr_context_is_bounded_to_same_repo_automation_branch(self):
        self.assertIn("github.event_name == 'pull_request'", self.workflow)
        self.assertIn("github.event.pull_request.head.repo.full_name == 'hamad933/GS-2'", self.workflow)
        self.assertIn("github.event.pull_request.head.ref == 'automation/gs-two-tier-control-v1'", self.workflow)
        self.assertNotIn("pull_request_target", self.workflow)
        self.assertIn("JULES_API_KEY: ${{ secrets.JULES_API_KEY }}", self.workflow)

    def test_candidate_shadow_runs_on_trusted_automation_push(self):
        self.assertIn("github.event_name == 'push'", self.workflow)
        self.assertIn("refs/heads/automation/gs-two-tier-control-v1", self.workflow)

    def test_default_branch_activation_events_are_explicitly_guarded(self):
        for event_name in ("schedule", "workflow_dispatch", "issues", "issue_comment", "workflow_run"):
            self.assertIn(event_name, self.workflow)
        self.assertIn("github.event.repository.default_branch", self.workflow)
        self.assertIn("format('refs/heads/{0}', github.event.repository.default_branch)", self.workflow)

    def test_secret_job_checks_out_exact_trusted_event_or_candidate_sha(self):
        self.assertIn("ref: ${{ github.event.pull_request.head.sha || github.sha }}", self.workflow)
        self.assertIn("EXACT_HEAD: ${{ github.event.pull_request.head.sha || github.sha }}", self.workflow)


if __name__ == "__main__":
    unittest.main()
