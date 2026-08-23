from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping

from jules_client import continuation_policy_for_state
from state_matcher import operation_key


@dataclass(frozen=True)
class RouteDecision:
    state: str
    action: str
    reason: str
    operation_key: str | None = None
    escalation: bool = False


def waiting_route(*, waiting_class: str, session_state: str, session_bound: bool,
                  receipt_exists: bool, action_in_flight: bool) -> RouteDecision:
    if not session_bound:
        return RouteDecision("SESSION_BINDING_REQUIRED", "PARENT_CONTROLLER", "no verified Jules session binding", escalation=True)
    if waiting_class != "POLICY_RESOLVABLE":
        return RouteDecision(waiting_class, "PARENT_CONTROLLER", "waiting input is not explicitly safe", escalation=True)
    policy = continuation_policy_for_state(session_state)
    if policy != "SEND_MESSAGE_CAPABLE":
        return RouteDecision(policy, "NO_AUTO_MESSAGE", "session state is not safe for automatic sendMessage", escalation=True)
    if receipt_exists or action_in_flight:
        return RouteDecision("NO_ACTION_IN_FLIGHT", "NO_ACTION", "same operation is already applied or in flight")
    return RouteDecision("POLICY_RESOLVABLE", "SEND_MESSAGE_EXISTING_SESSION", "safe same-session continuation")


def reviewer_to_writer(*, repo: str, workstream: str, review_packet: Mapping[str, Any], current_pr_sha: str,
                       writer_session_id: str | None, writer_binding_status: str,
                       writer_pr: int | None, writer_head_sha: str | None,
                       receipt_exists: bool, action_in_flight: bool) -> RouteDecision:
    reviewed_sha = str(review_packet.get("candidate_sha") or "")
    if not reviewed_sha or reviewed_sha != current_pr_sha:
        return RouteDecision("STALE_REVIEW", "REJECT_STALE_REVIEW", "review SHA does not equal current PR head", escalation=True)
    if review_packet.get("reviewer_mutation"):
        return RouteDecision("REVIEWER_MUTATION_DETECTED", "PARENT_ADJUDICATION", "reviewer was not read-only", escalation=True)
    if not review_packet.get("scope_match", True):
        return RouteDecision("REVIEW_SCOPE_MISMATCH", "REJECT_REVIEW", "review scope mismatch", escalation=True)
    if writer_binding_status not in {"BOUND_EXPLICIT", "BOUND_CONFIRMED"} or not writer_session_id:
        return RouteDecision("SESSION_OWNERSHIP_AMBIGUOUS", "PARENT_CONTROLLER", "writer session ownership is not directly bound", escalation=True)
    if receipt_exists or action_in_flight:
        return RouteDecision("NO_ACTION_IN_FLIGHT", "NO_ACTION", "correction already applied or in progress")
    findings = review_packet.get("findings") or []
    key = operation_key(
        repo=repo, workstream=workstream, role="WRITER", task_session=writer_session_id,
        pr=writer_pr, head_sha=writer_head_sha or current_pr_sha,
        normalized_input={"reviewed_sha": reviewed_sha, "findings": findings},
        action_type="REVIEWER_TO_WRITER_CORRECTION",
    )
    return RouteDecision("CORRECTION_PENDING", "SEND_ONE_GROUPED_CORRECTION_PACKET", "exact-SHA clean review can route to existing writer", key)


def writer_to_reviewer(*, repo: str, workstream: str, candidate: Mapping[str, Any],
                       expected_branch: str, expected_pr: int, reviewer_session_id: str | None,
                       reviewer_binding_status: str, reviewer_continuation_available: bool,
                       receipt_exists: bool, action_in_flight: bool) -> RouteDecision:
    if candidate.get("branch") != expected_branch or int(candidate.get("pr") or 0) != int(expected_pr):
        return RouteDecision("PUBLICATION_BASE_MISMATCH", "FAIL_CLOSED", "writer branch/PR ownership mismatch", escalation=True)
    head_sha = str(candidate.get("head_sha") or "")
    if not head_sha:
        return RouteDecision("NO_CANDIDATE", "NO_ACTION", "exact candidate SHA unavailable", escalation=True)
    if candidate.get("changed_outside_scope") or candidate.get("writer_collision"):
        return RouteDecision("AUTHORITY_REQUIRED", "FAIL_CLOSED", "scope or writer collision", escalation=True)
    if candidate.get("ci_state") not in {"SUCCESS", "NO_RUN_ALLOWED_BY_CONTRACT"}:
        return RouteDecision("CI_EVIDENCE_DEPENDENT", "WAIT_FOR_EXACT_HEAD_CI", "candidate is not ready for reviewer routing")
    if receipt_exists or action_in_flight:
        return RouteDecision("NO_ACTION_IN_FLIGHT", "NO_ACTION", "review request already applied or in flight")
    if reviewer_binding_status in {"BOUND_EXPLICIT", "BOUND_CONFIRMED"} and reviewer_session_id and reviewer_continuation_available:
        key = operation_key(
            repo=repo, workstream=workstream, role="REVIEWER_A", task_session=reviewer_session_id,
            pr=expected_pr, head_sha=head_sha, normalized_input={"candidate_sha": head_sha},
            action_type="WRITER_TO_REVIEWER_REREVIEW",
        )
        return RouteDecision("RE_REVIEW_PENDING", "SEND_REREVIEW_EXISTING_SESSION", "reuse existing reviewer lineage", key)
    return RouteDecision("DOUBLE_ASSURANCE_REQUIRED", "NEW_TASK_RECOMMENDED", "no safe existing reviewer continuation; Parent decides task creation", escalation=True)
