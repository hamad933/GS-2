import json
import unittest

from jules_client import HttpResponseError, JulesClient
from jules_write_recovery import inspect_send_message_outcome, message_digest


class FakeTransport:
    def __init__(self, steps): self.steps=list(steps)
    def __call__(self, method, url, headers, body, timeout):
        step=self.steps.pop(0)
        if isinstance(step, Exception): raise step
        status, response_headers, payload=step
        raw=payload if isinstance(payload, bytes) else json.dumps(payload).encode()
        if status >= 400: raise HttpResponseError(status, response_headers, raw)
        return status, response_headers, raw


class JulesWriteRecoveryTests(unittest.TestCase):
    def test_ambiguous_write_confirmed_present_by_activity_digest(self):
        client=JulesClient(api_key="dummy", transport=FakeTransport([(200, {}, {"activities":[
            {"id":"act-1","createTime":"2026-08-23T01:00:00Z","userMessaged":{"userMessage":"safe continuation"}}
        ]})]))
        result=inspect_send_message_outcome(client, "session-1", "safe continuation")
        self.assertEqual(result.classification, "WRITE_CONFIRMED_PRESENT")
        self.assertEqual(result.payload["message_digest"], message_digest("safe continuation"))
        self.assertNotIn("safe continuation", json.dumps(result.payload))

    def test_ambiguous_write_confirmed_absent_allows_parent_to_consider_retry(self):
        client=JulesClient(api_key="dummy", transport=FakeTransport([(200, {}, {"activities":[]})]))
        result=inspect_send_message_outcome(client, "session-1", "safe continuation")
        self.assertEqual(result.classification, "WRITE_CONFIRMED_ABSENT")

    def test_failed_post_state_read_keeps_outcome_unknown(self):
        client=JulesClient(api_key="dummy", transport=FakeTransport([HttpResponseError(503, {}, b'{}')] * 3), sleeper=lambda _: None)
        result=inspect_send_message_outcome(client, "session-1", "safe continuation")
        self.assertEqual(result.classification, "WRITE_OUTCOME_STILL_UNKNOWN")


if __name__ == "__main__": unittest.main()
