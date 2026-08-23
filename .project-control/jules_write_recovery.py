from __future__ import annotations

from hashlib import sha256
from typing import Any, Mapping

from jules_client import JulesApiResult, JulesClient


def message_digest(message: str) -> str:
    return sha256(message.encode("utf-8")).hexdigest()


def inspect_send_message_outcome(client: JulesClient, session_id: str, expected_message: str) -> JulesApiResult:
    """Authoritative post-state inspection after an ambiguous sendMessage result.

    The expected message is never logged or persisted by this function. Only its digest and
    a matched provider activity ID are returned.
    """
    if not session_id or not expected_message:
        return JulesApiResult(False, "WRITE_OUTCOME_INSPECTION_INVALID")
    activities = client.list_all_activities(session_id, page_size=100)
    if not activities.ok:
        return JulesApiResult(False, "WRITE_OUTCOME_STILL_UNKNOWN",
                              {"read_classification": activities.classification},
                              activities.status_code, activities.retry_after, activities.request_id)
    expected = message_digest(expected_message)
    for activity in activities.payload.get("activities", []):
        if not isinstance(activity, Mapping):
            continue
        event = activity.get("userMessaged")
        if not isinstance(event, Mapping):
            continue
        message = event.get("userMessage")
        if isinstance(message, str) and message_digest(message) == expected:
            return JulesApiResult(True, "WRITE_CONFIRMED_PRESENT", {
                "message_digest": expected,
                "activity_id": str(activity.get("id") or ""),
                "create_time": activity.get("createTime"),
            })
    return JulesApiResult(True, "WRITE_CONFIRMED_ABSENT", {"message_digest": expected})
