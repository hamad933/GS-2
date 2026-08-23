import unittest
from jules_existing_session import ExistingSessionJulesClient

class JulesExistingSessionOnly(unittest.TestCase):
    def setUp(self):
        self.client=ExistingSessionJulesClient(api_key=None)

    def test_no_create_session_capability(self):
        self.assertFalse(hasattr(self.client,"create_session"))

    def test_unbound_session_fails_closed(self):
        r=self.client.get_session(None)
        self.assertFalse(r.ok)
        self.assertEqual(r.classification,"SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")

    def test_non_policy_message_denied_before_network(self):
        r=self.client.send_safe_message("123","x",waiting_class="OWNER_OR_CONTROLLER_AUTHORITY_REQUIRED",operation_already_applied=False)
        self.assertFalse(r.ok)
        self.assertEqual(r.classification,"FAST_CONTROLLER_SEND_DENIED_NOT_POLICY_RESOLVABLE")

    def test_duplicate_message_is_noop(self):
        r=self.client.send_safe_message("123","x",waiting_class="POLICY_RESOLVABLE",operation_already_applied=True)
        self.assertFalse(r.ok)
        self.assertEqual(r.classification,"IDEMPOTENT_NOOP_ALREADY_APPLIED")

    def test_plan_contract_mismatch_denied(self):
        r=self.client.approve_plan("123",plan_contract_match=False,operation_already_applied=False)
        self.assertFalse(r.ok)
        self.assertEqual(r.classification,"FAST_CONTROLLER_PLAN_APPROVAL_DENIED_CONTRACT_MISMATCH")

if __name__=="__main__":
    unittest.main()
