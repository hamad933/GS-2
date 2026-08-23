import os
import unittest
from pathlib import Path


class WorkflowSecretContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow = Path(os.environ["GS_TEST_WORKFLOW"]).read_text(encoding="utf-8")

    def test_pull_request_code_never_receives_jules_secret(self):
        self.assertNotIn("github.event_name == 'pull_request'", self.workflow)
        self.assertNotIn("pull_request_target", self.workflow)
        self.assertIn("JULES_API_KEY: ${{ secrets.JULES_API_KEY }}", self.workflow)

    def test_candidate_shadow_still_runs_on_trusted_automation_push(self):
        self.assertIn("github.event_name == 'push'", self.workflow)
        self.assertIn("refs/heads/automation/gs-two-tier-control-v1", self.workflow)

    def test_default_branch_activation_events_are_explicitly_guarded(self):
        for event_name in ("schedule", "workflow_dispatch", "issues", "issue_comment", "workflow_run"):
            self.assertIn(event_name, self.workflow)
        self.assertIn("github.event.repository.default_branch", self.workflow)
        self.assertIn("format('refs/heads/{0}', github.event.repository.default_branch)", self.workflow)

    def test_secret_job_checks_out_trusted_event_sha_not_pr_head(self):
        self.assertIn("ref: ${{ github.sha }}", self.workflow)
        self.assertNotIn("github.event.pull_request.head.sha || github.sha", self.workflow)


if __name__ == "__main__":
    unittest.main()
