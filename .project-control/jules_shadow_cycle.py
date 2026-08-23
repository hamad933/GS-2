from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Mapping

from jules_client import JulesClient, sanitize
from jules_reconciliation import build_source_index, reconcile, sanitize_session, session_repository
from operation_safety import CircuitBreaker


def _failure(*, phase: str, classification: str, breaker: CircuitBreaker,
             status_code: int | None = None, retry_after: float | None = None) -> dict:
    return {
        "schema_version": 3,
        "phase": phase,
        "capability_state": classification,
        "control_mode": "DEGRADED_GITHUB_ONLY",
        "http_status": status_code,
        "retry_after": retry_after,
        "jules_mutations_enabled": False,
        "session_inventory": [],
        "project_session_inventory": [],
        "reconciliation": None,
        "waiting_inputs": [],
        "circuit_open": breaker.open,
    }


def _latest_waiting_question(activities: list[Mapping[str, Any]]) -> dict[str, Any] | None:
    ordered = sorted(activities, key=lambda activity: str(activity.get("createTime") or ""), reverse=True)
    for activity in ordered:
        event = activity.get("agentMessaged")
        if isinstance(event, Mapping) and event.get("agentMessage"):
            return {
                "activity_id": str(activity.get("id") or ""),
                "create_time": activity.get("createTime"),
                "originator": activity.get("originator"),
                "question_text": str(event.get("agentMessage")),
            }
    return None


def _budget_history_view(*, unattributed_session_count: int) -> dict[str, str]:
    """Separate current provider inventory from lifetime project task history.

    A complete current Sessions/Sources enumeration proves only the inventory visible
    through the current provider API. It does not prove that deleted, expired, or
    otherwise non-enumerable historical sessions never consumed the governed project
    task budget.
    """
    inventory_state = (
        "CURRENT_PROVIDER_ENUMERATION_COMPLETE_FOR_REPOSITORY"
        if unattributed_session_count == 0
        else "CURRENT_PROVIDER_ENUMERATION_PARTIAL_UNATTRIBUTED_SESSIONS"
    )
    return {
        "provider_inventory_state": inventory_state,
        "lifetime_task_budget_history_state": "UNVERIFIED_PREEXISTING_HISTORY_NOT_PROVEN_BY_CURRENT_ENUMERATION",
        "exact_remaining_safe_capacity": "UNKNOWN",
        "new_task_creation_safety": "FROZEN_WHILE_LIFETIME_HISTORY_COULD_RISK_TASK_BUDGET_TOTAL",
    }


def run(config: dict) -> dict:
    client = JulesClient()
    breaker = CircuitBreaker()
    if not client.available:
        return _failure(phase="AUTH_PROBE", classification="JULES_API_SECRET_MISSING", breaker=breaker)

    probe = client.probe()
    breaker.record(probe.classification)
    if not probe.ok:
        return _failure(phase="AUTH_PROBE", classification=probe.classification, breaker=breaker,
                        status_code=probe.status_code, retry_after=probe.retry_after)

    all_sessions = client.list_all_sessions(page_size=100)
    breaker.record(all_sessions.classification)
    if not all_sessions.ok:
        return _failure(phase="RECONCILIATION_DRY_RUN", classification=all_sessions.classification,
                        breaker=breaker, status_code=all_sessions.status_code, retry_after=all_sessions.retry_after)

    all_sources = client.list_all_sources(page_size=100)
    breaker.record(all_sources.classification)
    if not all_sources.ok:
        return _failure(phase="RECONCILIATION_DRY_RUN", classification=all_sources.classification,
                        breaker=breaker, status_code=all_sources.status_code, retry_after=all_sources.retry_after)

    sessions = all_sessions.payload.get("sessions", [])
    sources = all_sources.payload.get("sources", [])
    source_index = build_source_index(sources)
    target_repo = str(config.get("repository") or "")
    project_sessions = [s for s in sessions if session_repository(s, source_index) == target_repo]
    unattributed_sessions = [s for s in sessions if session_repository(s, source_index) is None]

    rec = reconcile(config, sessions, sources)
    waiting_inputs: list[dict[str, Any]] = []
    for mapping in rec.get("mappings") or []:
        session = mapping.get("session") or {}
        if session.get("state") != "AWAITING_USER_FEEDBACK" or not session.get("id"):
            continue
        activities = client.list_all_activities(str(session["id"]), page_size=100)
        breaker.record(activities.classification)
        if not activities.ok:
            waiting_inputs.append({
                "lane_id": mapping.get("lane_id"),
                "session_id": session.get("id"),
                "state": session.get("state"),
                "activity_probe_state": activities.classification,
                "waiting_class": "UNCLASSIFIED_INPUT_REQUIRED",
            })
            continue
        question = _latest_waiting_question(activities.payload.get("activities", []))
        waiting_inputs.append({
            "lane_id": mapping.get("lane_id"),
            "session_id": session.get("id"),
            "state": session.get("state"),
            "activity_probe_state": "OK",
            "waiting_class": "UNCLASSIFIED_INPUT_REQUIRED",
            "latest_agent_question": question,
        })

    budget_view = _budget_history_view(unattributed_session_count=len(unattributed_sessions))
    return {
        "schema_version": 3,
        "phase": "SHADOW_ROUTING",
        "capability_state": "JULES_API_READY",
        "control_mode": "SHADOW_NO_MUTATION",
        "jules_mutations_enabled": False,
        "account_session_count": len(sessions),
        "project_session_count": len(project_sessions),
        "unattributed_session_count": len(unattributed_sessions),
        **budget_view,
        "session_inventory": [sanitize_session(s, source_index) for s in sessions],
        "project_session_inventory": [sanitize_session(s, source_index) for s in project_sessions],
        "reconciliation": sanitize(rec),
        "waiting_inputs": sanitize(waiting_inputs),
        "circuit_open": breaker.open,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=str(Path(__file__).with_name("live_config.json")))
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    config = json.loads(Path(args.config).read_text(encoding="utf-8"))
    result = run(config)
    Path(args.out).write_text(json.dumps(result, indent=2, ensure_ascii=False, sort_keys=True), encoding="utf-8")


if __name__ == "__main__":
    main()
