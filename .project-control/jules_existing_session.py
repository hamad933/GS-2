from __future__ import annotations
import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

BASE_URL = "https://jules.googleapis.com/v1alpha"

@dataclass(frozen=True)
class JulesApiResult:
    ok: bool
    classification: str
    payload: Any = None
    status_code: int | None = None

class ExistingSessionJulesClient:
    """Jules REST client deliberately incapable of creating a new session.

    Fast Controller may inspect an already-bound session and, only after an
    external deterministic policy decision, send a message or approve its plan.
    There is intentionally no create_session method.
    """

    def __init__(self, api_key: str | None = None, timeout: float = 15.0):
        self.api_key = api_key or os.getenv("JULES_API_KEY")
        self.timeout = timeout

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    def _request(self, method: str, path: str, body: dict | None = None) -> JulesApiResult:
        if not self.api_key:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_NO_JULES_API_KEY")
        data = None if body is None else json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}{path}", data=data, method=method,
            headers={"x-goog-api-key": self.api_key, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read()
                payload = json.loads(raw) if raw else {}
                return JulesApiResult(True, "OK", payload, resp.status)
        except urllib.error.HTTPError as exc:
            raw = exc.read()
            try: payload = json.loads(raw) if raw else {}
            except Exception: payload = {"raw": raw.decode("utf-8", errors="replace")}
            classification = {
                401: "AUTHENTICATION_FAILED", 403: "AUTHORIZATION_FAILED",
                404: "SESSION_NOT_FOUND", 429: "RATE_LIMITED"
            }.get(exc.code, "JULES_API_HTTP_ERROR")
            return JulesApiResult(False, classification, payload, exc.code)
        except Exception as exc:
            return JulesApiResult(False, "JULES_API_TRANSPORT_ERROR", {"error": str(exc)})

    def get_session(self, session_id: str | None) -> JulesApiResult:
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._request("GET", f"/sessions/{session_id}")

    def list_activities(self, session_id: str | None, page_size: int = 100,
                        page_token: str | None = None) -> JulesApiResult:
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        q = f"?pageSize={max(1, min(100, page_size))}"
        if page_token:
            from urllib.parse import quote
            q += f"&pageToken={quote(page_token)}"
        return self._request("GET", f"/sessions/{session_id}/activities{q}")

    def send_safe_message(self, session_id: str | None, prompt: str,
                          *, waiting_class: str, operation_already_applied: bool) -> JulesApiResult:
        if waiting_class != "POLICY_RESOLVABLE":
            return JulesApiResult(False, "FAST_CONTROLLER_SEND_DENIED_NOT_POLICY_RESOLVABLE")
        if operation_already_applied:
            return JulesApiResult(False, "IDEMPOTENT_NOOP_ALREADY_APPLIED")
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._request("POST", f"/sessions/{session_id}:sendMessage", {"prompt": prompt})

    def approve_plan(self, session_id: str | None, *, plan_contract_match: bool,
                     operation_already_applied: bool) -> JulesApiResult:
        if not plan_contract_match:
            return JulesApiResult(False, "FAST_CONTROLLER_PLAN_APPROVAL_DENIED_CONTRACT_MISMATCH")
        if operation_already_applied:
            return JulesApiResult(False, "IDEMPOTENT_NOOP_ALREADY_APPLIED")
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._request("POST", f"/sessions/{session_id}:approvePlan", {})
