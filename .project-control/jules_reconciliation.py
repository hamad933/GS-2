from __future__ import annotations

import re
from collections import defaultdict
from typing import Any, Iterable, Mapping

from jules_client import normalize_session_state, sanitize

PR_RE = re.compile(r"github\.com/[^/]+/[^/]+/pull/(\d+)")


def _pr_numbers(session: Mapping[str, Any]) -> set[int]:
    numbers: set[int] = set()
    for output in session.get("outputs") or []:
        if not isinstance(output, Mapping):
            continue
        pr = output.get("pullRequest")
        if isinstance(pr, Mapping):
            match = PR_RE.search(str(pr.get("url") or ""))
            if match:
                numbers.add(int(match.group(1)))
    return numbers


def _source_branch(session: Mapping[str, Any]) -> str | None:
    context = session.get("sourceContext")
    if not isinstance(context, Mapping):
        return None
    github_context = context.get("githubRepoContext")
    if isinstance(github_context, Mapping):
        value = github_context.get("startingBranch")
        return str(value) if value else None
    return None


def sanitize_session(session: Mapping[str, Any]) -> dict[str, Any]:
    context = session.get("sourceContext") if isinstance(session.get("sourceContext"), Mapping) else {}
    return sanitize({
        "id": str(session.get("id") or ""),
        "name": str(session.get("name") or ""),
        "state": normalize_session_state(session.get("state")),
        "url": str(session.get("url") or ""),
        "createTime": session.get("createTime"),
        "updateTime": session.get("updateTime"),
        "source": context.get("source") if isinstance(context, Mapping) else None,
        "startingBranch": _source_branch(session),
        "pullRequests": sorted(_pr_numbers(session)),
    })


def _candidate_score(expected: Mapping[str, Any], session: Mapping[str, Any]) -> int:
    score = 0
    sid = str(session.get("id") or "")
    url = str(session.get("url") or "")
    task_id = str(expected.get("task_id") or "")
    if task_id and sid == task_id:
        score += 100
    if task_id and task_id in url:
        score += 80
    expected_pr = expected.get("pr")
    if expected_pr and int(expected_pr) in _pr_numbers(session):
        score += 70
    expected_branch = expected.get("branch")
    if expected_branch and expected_branch == _source_branch(session):
        score += 50
    return score


def build_expected_lanes(config: Mapping[str, Any]) -> list[dict[str, Any]]:
    lanes: list[dict[str, Any]] = []
    for reviewer in config.get("reviewer_a", []):
        lanes.append({
            "lane_id": f"REVIEWER_A:{reviewer['page']}", "role": "REVIEWER_A",
            "workstream": reviewer["page"], "task_id": reviewer.get("task_id"),
            "session_id": reviewer.get("session_id"), "issue": reviewer.get("issue"),
            "pr": None, "branch": None,
        })
    for name, writer in config.get("writer_lineages", {}).items():
        lanes.append({
            "lane_id": f"WRITER:{name}", "role": "WRITER", "workstream": name,
            "task_id": writer.get("task_id"), "session_id": writer.get("session_id"),
            "issue": writer.get("issue"), "pr": writer.get("pr"), "branch": writer.get("branch"),
        })
    return lanes


def reconcile(config: Mapping[str, Any], sessions: Iterable[Mapping[str, Any]]) -> dict[str, Any]:
    session_list = [dict(s) for s in sessions]
    mappings: list[dict[str, Any]] = []
    used: defaultdict[str, list[str]] = defaultdict(list)
    for lane in build_expected_lanes(config):
        explicit = str(lane.get("session_id") or "")
        if explicit:
            direct = [s for s in session_list if str(s.get("id") or "") == explicit]
            if len(direct) == 1:
                mappings.append({"lane_id": lane["lane_id"], "status": "BOUND_EXPLICIT",
                                 "session": sanitize_session(direct[0]), "score": 1000})
                used[explicit].append(lane["lane_id"])
                continue
            mappings.append({"lane_id": lane["lane_id"], "status": "EXPLICIT_SESSION_NOT_FOUND", "session_id": explicit})
            continue
        scored = [(s, _candidate_score(lane, s)) for s in session_list]
        scored = [(s, score) for s, score in scored if score > 0]
        if not scored:
            mappings.append({"lane_id": lane["lane_id"], "status": "NO_MATCH"})
            continue
        best = max(score for _, score in scored)
        winners = [s for s, score in scored if score == best]
        if len(winners) != 1:
            mappings.append({"lane_id": lane["lane_id"], "status": "SESSION_OWNERSHIP_AMBIGUOUS",
                             "candidate_session_ids": sorted(str(s.get("id") or "") for s in winners), "score": best})
            continue
        sid = str(winners[0].get("id") or "")
        mappings.append({"lane_id": lane["lane_id"], "status": "PROPOSED_UNVERIFIED",
                         "session": sanitize_session(winners[0]), "score": best})
        used[sid].append(lane["lane_id"])
    duplicate_sessions = {sid: lanes for sid, lanes in used.items() if sid and len(lanes) > 1}
    if duplicate_sessions:
        for mapping in mappings:
            sid = (mapping.get("session") or {}).get("id")
            if sid in duplicate_sessions:
                mapping["status"] = "SESSION_OWNERSHIP_AMBIGUOUS"
                mapping["conflicting_lanes"] = duplicate_sessions[sid]
    return {
        "schema_version": 1, "mode": "RECONCILIATION_DRY_RUN", "mappings": mappings,
        "unmatched_sessions": [sanitize_session(s) for s in session_list if str(s.get("id") or "") not in used],
        "ambiguous": any(m["status"] == "SESSION_OWNERSHIP_AMBIGUOUS" for m in mappings),
    }
