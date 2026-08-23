from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from hashlib import sha256
from typing import Any, Mapping, Iterable
import json

class WorkstreamState(str, Enum):
    DISCOVERED="DISCOVERED"; NO_CANDIDATE="NO_CANDIDATE"; WRITER_ACTIVE="WRITER_ACTIVE"
    WRITER_WAITING="WRITER_WAITING"; CANDIDATE_PUBLISHED="CANDIDATE_PUBLISHED"
    CANDIDATE_DRAFT="CANDIDATE_DRAFT"; CANDIDATE_NON_DRAFT_UNAUTHORIZED="CANDIDATE_NON_DRAFT_UNAUTHORIZED"
    PUBLICATION_BASE_MISMATCH="PUBLICATION_BASE_MISMATCH"; BASELINE_DRIFT="BASELINE_DRIFT"
    HEAD_DRIFT="HEAD_DRIFT"; CANDIDATE_STALE="CANDIDATE_STALE"; REVIEW_PENDING="REVIEW_PENDING"
    CORRECTION_PENDING="CORRECTION_PENDING"; RE_REVIEW_PENDING="RE_REVIEW_PENDING"
    PARENT_REVIEW_PENDING="PARENT_REVIEW_PENDING"; AUTHORITY_REQUIRED="AUTHORITY_REQUIRED"
    STOP_GATE_REACHED="STOP_GATE_REACHED"; TERMINAL_ACCEPTED_EXTERNALLY="TERMINAL_ACCEPTED_EXTERNALLY"
    UNKNOWN_WORKSTREAM_STATE="UNKNOWN_WORKSTREAM_STATE"

class JulesState(str, Enum):
    QUEUED="QUEUED"; PLANNING="PLANNING"; AWAITING_PLAN_APPROVAL="AWAITING_PLAN_APPROVAL"
    AWAITING_USER_FEEDBACK="AWAITING_USER_FEEDBACK"; IN_PROGRESS="IN_PROGRESS"; PAUSED="PAUSED"
    COMPLETED="COMPLETED"; FAILED="FAILED"; CANCELLED="CANCELLED"
    CONTEXT_EXHAUSTED_PROVEN="CONTEXT_EXHAUSTED_PROVEN"
    SESSION_CONTINUATION_UNAVAILABLE="SESSION_CONTINUATION_UNAVAILABLE"
    UNKNOWN_JULES_STATE="UNKNOWN_JULES_STATE"

class CIState(str, Enum):
    NO_RUN="NO_RUN"; QUEUED="QUEUED"; IN_PROGRESS="IN_PROGRESS"; SUCCESS="SUCCESS"; FAILURE="FAILURE"
    CANCELLED="CANCELLED"; TIMED_OUT="TIMED_OUT"; ACTION_REQUIRED="ACTION_REQUIRED"; STALE_SHA="STALE_SHA"
    EXTERNAL_TRANSIENT_FAILURE="EXTERNAL_TRANSIENT_FAILURE"; WORKSTREAM_OWNED_FAILURE="WORKSTREAM_OWNED_FAILURE"
    SHARED_OR_EXTERNAL_FAILURE="SHARED_OR_EXTERNAL_FAILURE"; ARTIFACT_LINEAGE_MISMATCH="ARTIFACT_LINEAGE_MISMATCH"
    UNKNOWN_CI_STATE="UNKNOWN_CI_STATE"

class ReviewState(str, Enum):
    NOT_REQUESTED="NOT_REQUESTED"; REVIEW_QUEUED="REVIEW_QUEUED"; REVIEW_IN_PROGRESS="REVIEW_IN_PROGRESS"
    PASS_FOR_PARENT_REVIEW="PASS_FOR_PARENT_REVIEW"; PASS_WITH_MINOR_POLISH="PASS_WITH_MINOR_POLISH"
    REVISION_REQUIRED="REVISION_REQUIRED"; BLOCKING_FAILURE="BLOCKING_FAILURE"; NOT_VERIFIABLE="NOT_VERIFIABLE"
    STALE_REVIEW="STALE_REVIEW"; REVIEW_SCOPE_MISMATCH="REVIEW_SCOPE_MISMATCH"
    REVIEWER_MUTATION_DETECTED="REVIEWER_MUTATION_DETECTED"; DOUBLE_ASSURANCE_REQUIRED="DOUBLE_ASSURANCE_REQUIRED"
    DOUBLE_ASSURANCE_PASS_PENDING_PARENT_REVIEW="DOUBLE_ASSURANCE_PASS_PENDING_PARENT_REVIEW"
    REVIEW_DISAGREEMENT_REQUIRES_ADJUDICATION="REVIEW_DISAGREEMENT_REQUIRES_ADJUDICATION"
    UNKNOWN_REVIEW_STATE="UNKNOWN_REVIEW_STATE"

class WaitingClass(str, Enum):
    POLICY_RESOLVABLE="POLICY_RESOLVABLE"; REVIEW_DEPENDENT="REVIEW_DEPENDENT"
    CI_EVIDENCE_DEPENDENT="CI_EVIDENCE_DEPENDENT"; ENVIRONMENT_MISMATCH="ENVIRONMENT_MISMATCH"
    TOOL_CAPABILITY_LIMIT="TOOL_CAPABILITY_LIMIT"; SHARED_CONTRACT_REQUIRED="SHARED_CONTRACT_REQUIRED"
    CROSS_WORKSTREAM_CONFLICT="CROSS_WORKSTREAM_CONFLICT"; BASELINE_OR_HEAD_DRIFT="BASELINE_OR_HEAD_DRIFT"
    WRITE_OUTCOME_UNKNOWN="WRITE_OUTCOME_UNKNOWN"; CONTEXT_EXHAUSTION_CLAIM="CONTEXT_EXHAUSTION_CLAIM"
    SCOPE_CHANGE_REQUIRED="SCOPE_CHANGE_REQUIRED"; NEW_TASK_REQUEST="NEW_TASK_REQUEST"
    OWNER_OR_CONTROLLER_AUTHORITY_REQUIRED="OWNER_OR_CONTROLLER_AUTHORITY_REQUIRED"
    UNCLASSIFIED_INPUT_REQUIRED="UNCLASSIFIED_INPUT_REQUIRED"

@dataclass(frozen=True)
class Decision:
    state: str
    action: str
    reason: str
    escalation: bool = False

def stable_digest(value: Any) -> str:
    raw=json.dumps(value, sort_keys=True, separators=(",",":"), ensure_ascii=False).encode()
    return sha256(raw).hexdigest()

def operation_key(*, repo:str, workstream:str, role:str, task_session:str|None, pr:int|None,
                  head_sha:str|None, normalized_input:Any, action_type:str) -> str:
    parts={
        "repo":repo,"workstream":workstream,"role":role,"task_session":task_session or "",
        "pr":pr or 0,"head_sha":head_sha or "","input_digest":stable_digest(normalized_input),
        "action_type":action_type,
    }
    return stable_digest(parts)

def normalize_jules(raw: str|None) -> JulesState:
    if not raw: return JulesState.UNKNOWN_JULES_STATE
    key=raw.strip().upper().replace("-","_").replace(" ","_")
    aliases={"RUNNING":"IN_PROGRESS","WAITING_FOR_USER":"AWAITING_USER_FEEDBACK",
             "WAITING_FOR_FEEDBACK":"AWAITING_USER_FEEDBACK","DONE":"COMPLETED","ERROR":"FAILED",
             "CANCELED":"CANCELLED"}
    key=aliases.get(key,key)
    try: return JulesState(key)
    except ValueError: return JulesState.UNKNOWN_JULES_STATE

def normalize_ci(raw: str|None, *, run_sha:str|None=None, expected_sha:str|None=None,
                 failure_owner:str|None=None, artifact_sha:str|None=None) -> CIState:
    if not raw: return CIState.NO_RUN
    if expected_sha and run_sha and run_sha != expected_sha: return CIState.STALE_SHA
    if expected_sha and artifact_sha and artifact_sha != expected_sha: return CIState.ARTIFACT_LINEAGE_MISMATCH
    key=raw.strip().upper().replace("-","_").replace(" ","_")
    aliases={"COMPLETED_SUCCESS":"SUCCESS","TIMED_OUT":"TIMED_OUT","ACTION_REQUIRED":"ACTION_REQUIRED"}
    key=aliases.get(key,key)
    if key=="FAILURE":
        if failure_owner=="workstream": return CIState.WORKSTREAM_OWNED_FAILURE
        if failure_owner=="transient": return CIState.EXTERNAL_TRANSIENT_FAILURE
        if failure_owner=="shared": return CIState.SHARED_OR_EXTERNAL_FAILURE
    try: return CIState(key)
    except ValueError: return CIState.UNKNOWN_CI_STATE

def classify_waiting(input_data: Mapping[str, Any]) -> WaitingClass:
    if input_data.get("authority_action") in {"merge","release","deploy","force_push","weaken_tests","accept"}:
        return WaitingClass.OWNER_OR_CONTROLLER_AUTHORITY_REQUIRED
    if input_data.get("new_task_requested"): return WaitingClass.NEW_TASK_REQUEST
    if input_data.get("scope_change"): return WaitingClass.SCOPE_CHANGE_REQUIRED
    if input_data.get("context_exhaustion_claim"): return WaitingClass.CONTEXT_EXHAUSTION_CLAIM
    if input_data.get("write_claimed") and not input_data.get("write_visible"): return WaitingClass.WRITE_OUTCOME_UNKNOWN
    if input_data.get("baseline_drift") or input_data.get("head_drift"): return WaitingClass.BASELINE_OR_HEAD_DRIFT
    if input_data.get("cross_workstream_conflict"): return WaitingClass.CROSS_WORKSTREAM_CONFLICT
    if input_data.get("shared_contract_missing"): return WaitingClass.SHARED_CONTRACT_REQUIRED
    if input_data.get("tool_capability_limit"): return WaitingClass.TOOL_CAPABILITY_LIMIT
    if input_data.get("environment_mismatch"): return WaitingClass.ENVIRONMENT_MISMATCH
    if input_data.get("ci_evidence_needed"): return WaitingClass.CI_EVIDENCE_DEPENDENT
    if input_data.get("review_needed"): return WaitingClass.REVIEW_DEPENDENT
    if input_data.get("within_authorized_scope") and input_data.get("head_valid") and input_data.get("policy_fact_proven"):
        return WaitingClass.POLICY_RESOLVABLE
    return WaitingClass.UNCLASSIFIED_INPUT_REQUIRED

def waiting_decision(input_data: Mapping[str, Any]) -> Decision:
    cls=classify_waiting(input_data)
    if cls is WaitingClass.POLICY_RESOLVABLE:
        return Decision(cls.value, "CONTINUE_EXISTING_SESSION_WITH_SAFE_ANSWER", "proven policy fact; no authority expansion", False)
    if cls is WaitingClass.WRITE_OUTCOME_UNKNOWN:
        return Decision(cls.value, "READ_AUTHORITATIVE_POST_STATE_BEFORE_RETRY", "write outcome unknown", True)
    return Decision(cls.value, "ESCALATE_NO_GUESS", "input is not explicitly safe for Fast Controller", True)

def review_decision(*, verdict:str|None, reviewed_sha:str|None, candidate_sha:str|None,
                    reviewer_changed_paths:Iterable[str]|None=(), reviewer_opened_code_pr:bool=False,
                    scope_match:bool=True, binding_proven:bool=True) -> Decision:
    changed=list(reviewer_changed_paths or ())
    if changed or reviewer_opened_code_pr:
        return Decision(ReviewState.REVIEWER_MUTATION_DETECTED.value, "PARENT_ADJUDICATION", "reviewer produced write activity", True)
    if not scope_match:
        return Decision(ReviewState.REVIEW_SCOPE_MISMATCH.value, "REJECT_REVIEW", "review surface/scope mismatch", True)
    if not binding_proven or not reviewed_sha:
        return Decision(ReviewState.NOT_VERIFIABLE.value, "REJECT_REVIEW", "exact candidate binding not proven", True)
    if candidate_sha and reviewed_sha != candidate_sha:
        return Decision(ReviewState.STALE_REVIEW.value, "REJECT_STALE_REVIEW", "review SHA differs from current candidate", True)
    v=(verdict or "").strip().upper()
    if v in {"IPA_PAGE_PASS","PASS"}:
        return Decision(ReviewState.PASS_FOR_PARENT_REVIEW.value, "RECOMMEND_REVIEWER_B_TO_PARENT", "clean exact-SHA Reviewer-A pass", True)
    if v in {"IPA_PAGE_PASS_WITH_NOTES","PASS_WITH_MINOR_POLISH"}:
        return Decision(ReviewState.PASS_WITH_MINOR_POLISH.value, "RECOMMEND_REVIEWER_B_TO_PARENT", "clean exact-SHA pass with non-material notes", True)
    if v in {"IPA_PAGE_REVISE_REQUIRED","REVISION_REQUIRED"}:
        return Decision(ReviewState.REVISION_REQUIRED.value, "ROUTE_GROUPED_FINDINGS_TO_EXISTING_WRITER", "material corrections required", False)
    if v in {"IPA_PAGE_BLOCKING_FAILURE","BLOCKING_FAILURE"}:
        return Decision(ReviewState.BLOCKING_FAILURE.value, "ROUTE_OR_ESCALATE_DEPENDING_ROOT_CAUSE", "blocking review result", True)
    if v in {"IPA_PAGE_NOT_VERIFIABLE","NOT_VERIFIABLE","SOURCE_BINDING_FAILED"}:
        return Decision(ReviewState.NOT_VERIFIABLE.value, "CONTINUE_EXISTING_REVIEWER_LINEAGE_IF_POSSIBLE", "review could not bind/verify", True)
    return Decision(ReviewState.UNKNOWN_REVIEW_STATE.value, "ESCALATE_UNKNOWN_REVIEW_STATE", "unrecognized verdict", True)

def double_assurance(a: Decision, b: Decision|None, *, a_sha:str|None, b_sha:str|None,
                     candidate_sha:str) -> Decision:
    if a.state not in {ReviewState.PASS_FOR_PARENT_REVIEW.value, ReviewState.PASS_WITH_MINOR_POLISH.value}:
        return Decision(a.state, "NO_REVIEWER_B_YET", "Reviewer-A not a clean pass", a.escalation)
    if b is None:
        return Decision(ReviewState.DOUBLE_ASSURANCE_REQUIRED.value, "PARENT_MAY_CREATE_REVIEWER_B_AFTER_BUDGET_CHECK", "second independent assurance required", True)
    if a_sha != candidate_sha or b_sha != candidate_sha:
        return Decision(ReviewState.STALE_REVIEW.value, "REJECT_SHA_MISMATCH", "both reviews must bind same exact candidate SHA", True)
    if b.state in {ReviewState.PASS_FOR_PARENT_REVIEW.value, ReviewState.PASS_WITH_MINOR_POLISH.value}:
        return Decision(ReviewState.DOUBLE_ASSURANCE_PASS_PENDING_PARENT_REVIEW.value, "PARENT_DIRECT_REVIEW", "two clean exact-SHA passes", True)
    if b.state in {ReviewState.REVISION_REQUIRED.value, ReviewState.BLOCKING_FAILURE.value}:
        return Decision(ReviewState.REVIEW_DISAGREEMENT_REQUIRES_ADJUDICATION.value, "ADJUDICATE_AND_ROUTE_VALID_FINDINGS", "second reviewer challenged prior pass", True)
    return Decision(ReviewState.REVIEW_DISAGREEMENT_REQUIRES_ADJUDICATION.value, "PARENT_ADJUDICATION", "assurance states disagree or are unclean", True)

def context_replacement_allowed(evidence: Mapping[str, Any]) -> bool:
    return bool(
        evidence.get("executor_explicit_limit") or
        evidence.get("session_terminal_no_continuation") or
        evidence.get("continuation_unavailable") or
        evidence.get("repeated_observed_context_loss")
    )

def new_task_gate(*, proven_used:int, unverified_preexisting:bool, requested_role:str,
                  context_exhaustion_proven:bool=False, unrecoverable_failure:bool=False,
                  independent_assurance_justified:bool=False, disjoint_write_domain:bool=False) -> Decision:
    if proven_used >= 30:
        return Decision("TASK_BUDGET_HARD_STOP","DENY_NEW_TASK","30-task ceiling reached",True)
    if unverified_preexisting:
        return Decision("TASK_BUDGET_UNCERTAIN","DENY_NEW_TASK_UNTIL_HISTORY_RESOLVED","provider history could make remaining capacity unsafe",True)
    justified=context_exhaustion_proven or unrecoverable_failure or independent_assurance_justified or disjoint_write_domain
    if not justified:
        return Decision("NEW_TASK_NOT_JUSTIFIED","REUSE_EXISTING_LINEAGE","normal correction/continuation does not justify a task",True)
    zone="NORMAL" if proven_used<=19 else "WARNING" if proven_used<=23 else "RESERVE"
    return Decision(f"TASK_CREATION_{zone}","PARENT_MAY_CREATE_AFTER_COLLISION_CHECK",f"justified new task; used={proven_used}",True)

def workstream_safety(snapshot: Mapping[str, Any]) -> Decision:
    if snapshot.get("pr_merged") or snapshot.get("pr_closed_unexpectedly"):
        return Decision(WorkstreamState.AUTHORITY_REQUIRED.value,"ESCALATE_PR_TERMINAL_CHANGE","PR merged/closed unexpectedly",True)
    if snapshot.get("pr_non_draft") and not snapshot.get("non_draft_authorized"):
        return Decision(WorkstreamState.CANDIDATE_NON_DRAFT_UNAUTHORIZED.value,"FLAG_AND_FREEZE_WRITES","PR unexpectedly non-draft",True)
    if snapshot.get("base_sha") and snapshot.get("registered_base_sha") and snapshot["base_sha"]!=snapshot["registered_base_sha"]:
        return Decision(WorkstreamState.BASELINE_DRIFT.value,"FAIL_CLOSED","base drift",True)
    if snapshot.get("head_sha") and snapshot.get("registered_head_sha") and snapshot["head_sha"]!=snapshot["registered_head_sha"]:
        return Decision(WorkstreamState.HEAD_DRIFT.value,"FAIL_CLOSED","head drift",True)
    if snapshot.get("writer_collision") or snapshot.get("shared_path_collision"):
        return Decision(WorkstreamState.AUTHORITY_REQUIRED.value,"FAIL_CLOSED_COLLISION","writer/write-domain collision",True)
    if snapshot.get("changed_outside_scope"):
        return Decision(WorkstreamState.AUTHORITY_REQUIRED.value,"FAIL_CLOSED_SCOPE_VIOLATION","changed path outside write scope",True)
    return Decision(WorkstreamState.DISCOVERED.value,"CONTINUE_SAFE_INSPECTION","no deterministic conflict found",False)
