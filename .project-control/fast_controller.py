from __future__ import annotations
import argparse, json
from pathlib import Path
from state_matcher import (
    normalize_jules, normalize_ci, waiting_decision, review_decision,
    workstream_safety, new_task_gate
)

def evaluate(snapshot: dict, policy: dict) -> dict:
    out={"mode":"DRY_RUN_FAIL_CLOSED","receipts":[],"recommendations":[]}
    for ws in snapshot.get("workstreams",[]):
        safe=workstream_safety(ws)
        out["receipts"].append({"workstream":ws.get("id"),"kind":"workstream","decision":safe.__dict__})
        if ws.get("waiting_input"):
            d=waiting_decision(ws["waiting_input"])
            out["receipts"].append({"workstream":ws.get("id"),"kind":"waiting","decision":d.__dict__})
        if ws.get("review"):
            r=ws["review"]
            d=review_decision(
                verdict=r.get("verdict"), reviewed_sha=r.get("reviewed_sha"),
                candidate_sha=ws.get("head_sha"), reviewer_changed_paths=r.get("reviewer_changed_paths",[]),
                reviewer_opened_code_pr=r.get("reviewer_opened_code_pr",False),
                scope_match=r.get("scope_match",True), binding_proven=r.get("binding_proven",True)
            )
            out["receipts"].append({"workstream":ws.get("id"),"kind":"review","decision":d.__dict__})
        if "jules_raw_state" in ws:
            out["receipts"].append({"workstream":ws.get("id"),"kind":"jules_state","state":normalize_jules(ws.get("jules_raw_state")).value})
        if "ci_raw_state" in ws:
            out["receipts"].append({"workstream":ws.get("id"),"kind":"ci_state","state":normalize_ci(
                ws.get("ci_raw_state"),run_sha=ws.get("ci_run_sha"),expected_sha=ws.get("head_sha"),
                failure_owner=ws.get("ci_failure_owner"),artifact_sha=ws.get("ci_artifact_sha")).value})
    budget=new_task_gate(
        proven_used=int(snapshot.get("budget",{}).get("proven_used",policy["proven_used"])),
        unverified_preexisting=bool(snapshot.get("budget",{}).get("unverified_preexisting",policy["unverified_preexisting"])),
        requested_role="UNKNOWN"
    )
    out["recommendations"].append({"kind":"new_task_gate","decision":budget.__dict__})
    out["production_writes_performed"]=False
    return out

def main():
    p=argparse.ArgumentParser()
    p.add_argument("snapshot")
    p.add_argument("--policy",default=str(Path(__file__).with_name("policy.json")))
    args=p.parse_args()
    snapshot=json.loads(Path(args.snapshot).read_text())
    policy=json.loads(Path(args.policy).read_text())
    print(json.dumps(evaluate(snapshot,policy),indent=2,ensure_ascii=False))

if __name__=="__main__":
    main()
