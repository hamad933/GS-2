from __future__ import annotations
import argparse, json
from pathlib import Path
from state_matcher import operation_key, new_task_gate


def run(snapshot: dict, policy: dict) -> dict:
    repo=snapshot["repository"]
    cand=snapshot["candidate"]
    receipts=[]

    if cand["live_head_sha"] != cand["registered_sha"] or cand["live_head_ref"] != cand["registered_branch"]:
        candidate_state="HEAD_DRIFT"
        candidate_action="FAIL_CLOSED"
    elif cand["merged"] or cand["state"] != "open":
        candidate_state="AUTHORITY_REQUIRED"
        candidate_action="ESCALATE_PR_TERMINAL_CHANGE"
    elif not cand["draft"]:
        candidate_state="CANDIDATE_NON_DRAFT_UNAUTHORIZED"
        candidate_action="FLAG_AND_FREEZE_WRITES"
    else:
        candidate_state="CANDIDATE_DRAFT"
        candidate_action="CONTINUE_SAFE_INSPECTION"
    receipts.append({
        "kind":"candidate",
        "state":candidate_state,"action":candidate_action,"head_sha":cand["live_head_sha"],
        "operation_key":operation_key(repo=repo,workstream="CURRENT_CANDIDATE",role="PRODUCT",
            task_session=None,pr=cand["pr"],head_sha=cand["live_head_sha"],
            normalized_input={"state":candidate_state},action_type="CONTROL_RECEIPT")
    })

    if not cand["workflow_runs"] and not cand["statuses"]:
        ci_state="NO_RUN"
    elif any(r.get("head_sha") != cand["live_head_sha"] for r in cand["workflow_runs"]):
        ci_state="STALE_SHA"
    elif any(r.get("status") != "completed" for r in cand["workflow_runs"]):
        ci_state="IN_PROGRESS"
    elif all(r.get("conclusion") == "success" for r in cand["workflow_runs"]):
        ci_state="SUCCESS"
    else:
        ci_state="FAILURE"
    receipts.append({"kind":"candidate_ci","state":ci_state,"head_sha":cand["live_head_sha"]})

    for lane in snapshot["reviewer_a"]:
        results=lane["result_prs"]
        if not results:
            state="REVIEW_IN_PROGRESS_PROVIDER_STATE_UNVERIFIED"
            action="MONITOR_NO_DUPLICATE"
            pr=None
            head_sha=cand["live_head_sha"]
        else:
            # The governing IPA contracts prohibit commits/pushes/PR creation.
            # A provider-created result PR is therefore not a clean read-only assurance surface.
            latest=results[0]
            pr=latest["number"]
            head_sha=latest["head_sha"]
            state="REVIEWER_MUTATION_DETECTED"
            action="PARENT_ADJUDICATION_NO_REVIEWER_B"
        receipts.append({
            "kind":"reviewer_a","page":lane["page"],"task_id":lane["task_id"],"state":state,
            "action":action,"result_pr":pr,"provider_session_binding":lane["provider_session_binding"],
            "operation_key":operation_key(repo=repo,workstream=lane["page"],role="REVIEWER_A",
                task_session=lane.get("session_id") or lane["task_id"],pr=pr,head_sha=head_sha,
                normalized_input={"state":state,"comment_ids":lane["github_comment_ids"]},action_type="CONTROL_RECEIPT")
        })

    gate=new_task_gate(proven_used=policy["proven_used"],unverified_preexisting=policy["unverified_preexisting"],requested_role="ANY")
    return {
        "schema_version":1,
        "mode":"FAST_CONTROLLER_READ_ONLY_FAIL_CLOSED",
        "production_writes_performed":False,
        "receipts":receipts,
        "new_task_gate":gate.__dict__,
        "jules_existing_session_actions_enabled":False,
        "jules_existing_session_reason":"SESSION_IDS_NOT_DIRECTLY_BOUND_AND_API_KEY_NOT_ASSUMED",
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("snapshot")
    p.add_argument("--policy",default=str(Path(__file__).with_name("policy.json")))
    p.add_argument("--out",required=True)
    a=p.parse_args()
    snap=json.loads(Path(a.snapshot).read_text())
    pol=json.loads(Path(a.policy).read_text())
    Path(a.out).write_text(json.dumps(run(snap,pol),indent=2,ensure_ascii=False))

if __name__=="__main__":
    main()
