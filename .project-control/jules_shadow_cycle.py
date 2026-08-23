from __future__ import annotations

import argparse
import json
from pathlib import Path

from jules_client import JulesClient, sanitize
from jules_reconciliation import reconcile, sanitize_session
from operation_safety import CircuitBreaker


def run(config: dict) -> dict:
    client = JulesClient()
    breaker = CircuitBreaker()
    if not client.available:
        return {
            "schema_version": 1,
            "phase": "AUTH_PROBE",
            "capability_state": "JULES_API_SECRET_MISSING",
            "control_mode": "DEGRADED_GITHUB_ONLY",
            "jules_mutations_enabled": False,
            "session_inventory": [],
            "reconciliation": None,
            "circuit_open": True,
        }
    probe = client.probe()
    breaker.record(probe.classification)
    if not probe.ok:
        return {
            "schema_version": 1,
            "phase": "AUTH_PROBE",
            "capability_state": probe.classification,
            "control_mode": "DEGRADED_GITHUB_ONLY",
            "http_status": probe.status_code,
            "retry_after": probe.retry_after,
            "jules_mutations_enabled": False,
            "session_inventory": [],
            "reconciliation": None,
            "circuit_open": breaker.open,
        }
    all_sessions = client.list_all_sessions(page_size=100)
    breaker.record(all_sessions.classification)
    if not all_sessions.ok:
        return {
            "schema_version": 1,
            "phase": "RECONCILIATION_DRY_RUN",
            "capability_state": all_sessions.classification,
            "control_mode": "DEGRADED_GITHUB_ONLY",
            "http_status": all_sessions.status_code,
            "retry_after": all_sessions.retry_after,
            "jules_mutations_enabled": False,
            "session_inventory": [],
            "reconciliation": None,
            "circuit_open": breaker.open,
        }
    sessions = all_sessions.payload.get("sessions", [])
    rec = reconcile(config, sessions)
    return {
        "schema_version": 1,
        "phase": "SHADOW_ROUTING",
        "capability_state": "JULES_API_READY",
        "control_mode": "SHADOW_NO_MUTATION",
        "jules_mutations_enabled": False,
        "session_inventory": [sanitize_session(s) for s in sessions],
        "reconciliation": sanitize(rec),
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
