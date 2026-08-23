from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = "https://api.github.com"

class GitHubReadOnly:
    def __init__(self, repo: str, token: str | None = None, timeout: float = 15.0):
        self.repo = repo
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.timeout = timeout

    def get(self, path: str, params: dict | None = None):
        url = f"{API}{path}"
        if params:
            url += "?" + urlencode(params)
        headers = {"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        with urlopen(Request(url, headers=headers), timeout=self.timeout) as r:
            return json.loads(r.read())

    def get_all(self, path: str, params: dict | None = None, *, item_key: str | None = None,
                max_pages: int = 20) -> list[dict]:
        base = dict(params or {})
        base["per_page"] = 100
        items: list[dict] = []
        for page in range(1, max_pages + 1):
            payload = self.get(path, {**base, "page": page})
            batch = payload.get(item_key, []) if item_key else payload
            if not isinstance(batch, list):
                raise ValueError(f"Expected list page for {path}")
            items.extend(batch)
            if len(batch) < 100:
                return items
        raise RuntimeError(f"Pagination limit reached for {path}; refusing partial inventory")

    def issue(self, number: int):
        return self.get(f"/repos/{self.repo}/issues/{number}")

    def issue_comments(self, number: int):
        return self.get_all(f"/repos/{self.repo}/issues/{number}/comments")

    def pull(self, number: int):
        return self.get(f"/repos/{self.repo}/pulls/{number}")

    def pull_files(self, number: int):
        return self.get_all(f"/repos/{self.repo}/pulls/{number}/files")

    def pulls(self):
        return self.get_all(f"/repos/{self.repo}/pulls", {"state":"all","sort":"created","direction":"desc"})

    def workflow_runs(self, head_sha: str):
        runs = self.get_all(f"/repos/{self.repo}/actions/runs", {"head_sha":head_sha}, item_key="workflow_runs")
        return {"workflow_runs": runs}

    def statuses(self, sha: str):
        return self.get(f"/repos/{self.repo}/commits/{sha}/status")


def discover_result_prs(pulls: list[dict], task_id: str) -> list[dict]:
    # Text is used only to discover the provider-linked PR; it is never used as the verdict/state engine.
    marker = f"task/{task_id}"
    out=[]
    for pr in pulls:
        if marker in (pr.get("body") or ""):
            out.append({"number":pr["number"],"state":pr["state"],"draft":pr.get("draft"),
                        "head_sha":pr["head"]["sha"],"head_ref":pr["head"]["ref"],
                        "base_sha":pr["base"]["sha"],"base_ref":pr["base"]["ref"]})
    return out


def build(config: dict, gh: GitHubReadOnly) -> dict:
    pulls = gh.pulls()
    candidate = config["candidate"]
    candidate_pr = gh.pull(candidate["pr"])
    candidate_sha = candidate_pr["head"]["sha"]
    workflow = gh.workflow_runs(candidate_sha)
    statuses = gh.statuses(candidate_sha)

    snapshot={
        "repository":config["repository"],
        "candidate":{
            "registered_sha":candidate["sha"],
            "registered_branch":candidate["branch"],
            "registered_base_sha":candidate.get("base_sha"),
            "registered_base_ref":candidate.get("base_branch"),
            "pr":candidate["pr"],
            "live_head_sha":candidate_sha,
            "live_head_ref":candidate_pr["head"]["ref"],
            "live_base_sha":candidate_pr["base"]["sha"],
            "live_base_ref":candidate_pr["base"]["ref"],
            "draft":candidate_pr.get("draft"),
            "state":candidate_pr.get("state"),
            "merged":bool(candidate_pr.get("merged_at")),
            "workflow_runs":[{"id":r["id"],"status":r["status"],"conclusion":r.get("conclusion"),"head_sha":r["head_sha"]} for r in workflow.get("workflow_runs",[])],
            "combined_status":statuses.get("state"),
            "statuses":[{"state":s.get("state"),"context":s.get("context"),"sha":s.get("sha")} for s in statuses.get("statuses",[])],
        },
        "reviewer_a":[],
        "writers":config.get("writer_lineages",{}),
    }
    for lane in config["reviewer_a"]:
        issue=gh.issue(lane["issue"])
        comments=gh.issue_comments(lane["issue"])
        results=discover_result_prs(pulls,lane["task_id"])
        result_details=[]
        for d in results:
            pr=gh.pull(d["number"])
            files=gh.pull_files(d["number"])
            result_details.append({**d,"merged":bool(pr.get("merged_at")),
                "changed_paths":[f["filename"] for f in files]})
        snapshot["reviewer_a"].append({
            **lane,
            "issue_state":issue.get("state"),
            "github_comment_ids":[c["id"] for c in comments],
            "result_prs":result_details,
            "provider_session_binding":"UNBOUND" if not lane.get("session_id") else "BOUND",
        })
    return snapshot


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--config", default=str(Path(__file__).with_name("live_config.json")))
    p.add_argument("--out", required=True)
    a=p.parse_args()
    cfg=json.loads(Path(a.config).read_text())
    snap=build(cfg,GitHubReadOnly(cfg["repository"]))
    Path(a.out).write_text(json.dumps(snap,indent=2,ensure_ascii=False))

if __name__=="__main__":
    main()
