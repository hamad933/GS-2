from __future__ import annotations

import json
import os
import random
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Callable, Mapping

BASE_URL = "https://jules.googleapis.com/v1alpha"
KNOWN_SESSION_STATES = {
    "QUEUED", "PLANNING", "AWAITING_PLAN_APPROVAL", "AWAITING_USER_FEEDBACK",
    "IN_PROGRESS", "PAUSED", "COMPLETED", "FAILED",
}
AUTO_MESSAGE_STATES = {"AWAITING_USER_FEEDBACK", "IN_PROGRESS"}
TERMINAL_STATES = {"COMPLETED", "FAILED"}
SENSITIVE_KEY_FRAGMENTS = ("secret", "token", "credential", "authorization", "api_key", "apikey", "key")


@dataclass(frozen=True)
class JulesApiResult:
    ok: bool
    classification: str
    payload: Any = None
    status_code: int | None = None
    retry_after: float | None = None
    request_id: str | None = None


class TransportError(Exception):
    pass


class HttpResponseError(Exception):
    def __init__(self, status: int, headers: Mapping[str, str] | None = None, body: bytes = b""):
        super().__init__(f"HTTP {status}")
        self.status = status
        self.headers = dict(headers or {})
        self.body = body


def sanitize(value: Any) -> Any:
    if isinstance(value, Mapping):
        out: dict[str, Any] = {}
        for key, item in value.items():
            lowered = str(key).lower().replace("-", "_")
            if any(fragment in lowered for fragment in SENSITIVE_KEY_FRAGMENTS):
                out[str(key)] = "[REDACTED]"
            elif lowered in {"prompt", "description", "title"}:
                continue
            else:
                out[str(key)] = sanitize(item)
        return out
    if isinstance(value, list):
        return [sanitize(item) for item in value]
    return value


def normalize_session_state(raw: Any) -> str:
    state = str(raw or "").strip().upper().replace("-", "_").replace(" ", "_")
    return state if state in KNOWN_SESSION_STATES else "UNKNOWN_JULES_STATE"


def continuation_policy_for_state(state: str) -> str:
    normalized = normalize_session_state(state)
    if normalized in TERMINAL_STATES:
        return "SESSION_CONTINUATION_UNAVAILABLE"
    if normalized == "PAUSED":
        return "JULES_SESSION_PAUSED_PARENT_REQUIRED"
    if normalized == "AWAITING_PLAN_APPROVAL":
        return "PLAN_APPROVAL_PATH_ONLY"
    if normalized in AUTO_MESSAGE_STATES:
        return "SEND_MESSAGE_CAPABLE"
    if normalized in {"QUEUED", "PLANNING"}:
        return "SESSION_BUSY_NO_MESSAGE"
    return "UNKNOWN_JULES_STATE"


class JulesClient:
    """Replaceable Jules REST adapter with bounded reads and no blind write retries."""

    def __init__(self, api_key: str | None = None, *, base_url: str = BASE_URL,
                 timeout: float = 15.0, max_read_attempts: int = 3,
                 sleeper: Callable[[float], None] = time.sleep,
                 jitter: Callable[[], float] = random.random,
                 transport: Callable[[str, str, Mapping[str, str], bytes | None, float], tuple[int, Mapping[str, str], bytes]] | None = None):
        self._api_key = api_key if api_key is not None else os.getenv("JULES_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_read_attempts = max(1, max_read_attempts)
        self._sleep = sleeper
        self._jitter = jitter
        self._transport = transport or self._urllib_transport

    @property
    def available(self) -> bool:
        return bool(self._api_key)

    @staticmethod
    def _urllib_transport(method: str, url: str, headers: Mapping[str, str], body: bytes | None, timeout: float):
        request = urllib.request.Request(url, data=body, method=method, headers=dict(headers))
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.status, dict(response.headers.items()), response.read()
        except urllib.error.HTTPError as exc:
            raise HttpResponseError(exc.code, dict(exc.headers.items()) if exc.headers else {}, exc.read()) from exc
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise TransportError(str(exc)) from exc

    @staticmethod
    def _retry_after(headers: Mapping[str, str]) -> float | None:
        raw = next((value for key, value in headers.items() if key.lower() == "retry-after"), None)
        if raw is None:
            return None
        try:
            return max(0.0, float(raw))
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _request_id(headers: Mapping[str, str]) -> str | None:
        for expected in ("x-request-id", "x-goog-request-id", "x-cloud-trace-context"):
            for actual, value in headers.items():
                if actual.lower() == expected:
                    return value
        return None

    @staticmethod
    def _decode_json(raw: bytes) -> tuple[bool, Any]:
        if not raw:
            return True, {}
        try:
            return True, json.loads(raw.decode("utf-8"))
        except Exception:
            return False, None

    def _headers(self) -> dict[str, str]:
        return {
            "x-goog-api-key": self._api_key or "",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "gs-fast-controller/1",
        }

    @staticmethod
    def _classify_http_error(status: int) -> str:
        if status == 401:
            return "JULES_API_UNAUTHORIZED"
        if status == 403:
            return "JULES_API_FORBIDDEN"
        if status == 429:
            return "JULES_API_RATE_LIMITED"
        if 500 <= status <= 599:
            return "JULES_API_PROVIDER_UNAVAILABLE"
        if status == 404:
            return "JULES_API_NOT_FOUND"
        if status == 400:
            return "JULES_API_PROTOCOL_OR_REQUEST_ERROR"
        return "JULES_API_UNKNOWN_FAILURE"

    def _request(self, method: str, path: str, body: Mapping[str, Any] | None = None, *, read: bool) -> JulesApiResult:
        if not self.available:
            return JulesApiResult(False, "JULES_API_SECRET_MISSING")
        encoded = None if body is None else json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        attempts = self.max_read_attempts if read else 1
        last_result = JulesApiResult(False, "JULES_API_UNKNOWN_FAILURE")
        for attempt in range(1, attempts + 1):
            try:
                status, headers, raw = self._transport(method, f"{self.base_url}{path}", self._headers(), encoded, self.timeout)
                valid_json, payload = self._decode_json(raw)
                request_id = self._request_id(headers)
                if 200 <= status <= 299:
                    if not valid_json:
                        return JulesApiResult(False, "JULES_API_RESPONSE_INVALID", None, status, request_id=request_id)
                    return JulesApiResult(True, "OK", payload, status, request_id=request_id)
                raise HttpResponseError(status, headers, raw)
            except HttpResponseError as exc:
                classification = self._classify_http_error(exc.status)
                retry_after = self._retry_after(exc.headers)
                valid_json, payload = self._decode_json(exc.body)
                last_result = JulesApiResult(False, classification, payload if valid_json else None,
                                             exc.status, retry_after, self._request_id(exc.headers))
                retryable = read and (exc.status == 429 or 500 <= exc.status <= 599)
                if not retryable or attempt >= attempts:
                    return last_result
                delay = retry_after if retry_after is not None else min(8.0, (2 ** (attempt - 1)) + self._jitter())
                self._sleep(delay)
            except TransportError:
                last_result = JulesApiResult(False, "JULES_API_PROVIDER_UNAVAILABLE")
                if not read or attempt >= attempts:
                    return last_result
                self._sleep(min(8.0, (2 ** (attempt - 1)) + self._jitter()))
            except Exception:
                return JulesApiResult(False, "JULES_API_UNKNOWN_FAILURE")
        return last_result

    def probe(self) -> JulesApiResult:
        result = self.list_sessions(page_size=1)
        if not result.ok:
            return result
        return JulesApiResult(True, "JULES_API_READY",
                              {"session_count_on_page": len(result.payload.get("sessions", []))},
                              result.status_code, request_id=result.request_id)

    def list_sessions(self, *, page_size: int = 30, page_token: str | None = None) -> JulesApiResult:
        query = {"pageSize": max(1, min(100, int(page_size)))}
        if page_token:
            query["pageToken"] = page_token
        result = self._request("GET", f"/sessions?{urllib.parse.urlencode(query)}", read=True)
        if not result.ok:
            return result
        payload = result.payload
        if not isinstance(payload, dict) or not isinstance(payload.get("sessions", []), list):
            return JulesApiResult(False, "JULES_API_PROTOCOL_CHANGED", None, result.status_code, request_id=result.request_id)
        for session in payload.get("sessions", []):
            if not isinstance(session, dict) or "id" not in session or "state" not in session:
                return JulesApiResult(False, "JULES_API_PROTOCOL_CHANGED", None, result.status_code, request_id=result.request_id)
        return result

    def list_all_sessions(self, *, page_size: int = 100, max_pages: int = 50) -> JulesApiResult:
        sessions: list[dict[str, Any]] = []
        token: str | None = None
        for _ in range(max_pages):
            result = self.list_sessions(page_size=page_size, page_token=token)
            if not result.ok:
                return result
            sessions.extend(result.payload.get("sessions", []))
            token = result.payload.get("nextPageToken") or None
            if not token:
                return JulesApiResult(True, "OK", {"sessions": sessions}, result.status_code, request_id=result.request_id)
        return JulesApiResult(False, "JULES_API_RESPONSE_INVALID", {"reason": "pagination_page_limit_exceeded"})

    def list_sources(self, *, page_size: int = 30, page_token: str | None = None) -> JulesApiResult:
        query = {"pageSize": max(1, min(100, int(page_size)))}
        if page_token:
            query["pageToken"] = page_token
        result = self._request("GET", f"/sources?{urllib.parse.urlencode(query)}", read=True)
        if not result.ok:
            return result
        payload = result.payload
        if not isinstance(payload, dict) or not isinstance(payload.get("sources", []), list):
            return JulesApiResult(False, "JULES_API_PROTOCOL_CHANGED", None, result.status_code, request_id=result.request_id)
        for source in payload.get("sources", []):
            repo = source.get("githubRepo") if isinstance(source, dict) else None
            if not isinstance(source, dict) or not source.get("name") or not isinstance(repo, dict) or not repo.get("owner") or not repo.get("repo"):
                return JulesApiResult(False, "JULES_API_PROTOCOL_CHANGED", None, result.status_code, request_id=result.request_id)
        return result

    def list_all_sources(self, *, page_size: int = 100, max_pages: int = 20) -> JulesApiResult:
        sources: list[dict[str, Any]] = []
        token: str | None = None
        for _ in range(max_pages):
            result = self.list_sources(page_size=page_size, page_token=token)
            if not result.ok:
                return result
            sources.extend(result.payload.get("sources", []))
            token = result.payload.get("nextPageToken") or None
            if not token:
                return JulesApiResult(True, "OK", {"sources": sources}, result.status_code, request_id=result.request_id)
        return JulesApiResult(False, "JULES_API_RESPONSE_INVALID", {"reason": "source_pagination_page_limit_exceeded"})

    def get_session(self, session_id: str) -> JulesApiResult:
        if not session_id:
            return JulesApiResult(False, "JULES_API_SESSION_ID_MISSING")
        result = self._request("GET", f"/sessions/{urllib.parse.quote(str(session_id), safe='')}", read=True)
        if not result.ok:
            return result
        if not isinstance(result.payload, dict) or "id" not in result.payload or "state" not in result.payload:
            return JulesApiResult(False, "JULES_API_PROTOCOL_CHANGED", None, result.status_code, request_id=result.request_id)
        return result

    def list_activities(self, session_id: str, *, page_size: int = 30, page_token: str | None = None) -> JulesApiResult:
        if not session_id:
            return JulesApiResult(False, "JULES_API_SESSION_ID_MISSING")
        query = {"pageSize": max(1, min(100, int(page_size)))}
        if page_token:
            query["pageToken"] = page_token
        result = self._request("GET", f"/sessions/{urllib.parse.quote(str(session_id), safe='')}/activities?{urllib.parse.urlencode(query)}", read=True)
        if not result.ok:
            return result
        if not isinstance(result.payload, dict) or not isinstance(result.payload.get("activities", []), list):
            return JulesApiResult(False, "JULES_API_PROTOCOL_CHANGED", None, result.status_code, request_id=result.request_id)
        return result

    def list_all_activities(self, session_id: str, *, page_size: int = 100, max_pages: int = 20) -> JulesApiResult:
        activities: list[dict[str, Any]] = []
        token: str | None = None
        for _ in range(max_pages):
            result = self.list_activities(session_id, page_size=page_size, page_token=token)
            if not result.ok:
                return result
            activities.extend(result.payload.get("activities", []))
            token = result.payload.get("nextPageToken") or None
            if not token:
                return JulesApiResult(True, "OK", {"activities": activities}, result.status_code, request_id=result.request_id)
        return JulesApiResult(False, "JULES_API_RESPONSE_INVALID", {"reason": "activity_pagination_page_limit_exceeded"})

    def send_message(self, session_id: str, prompt: str, *, known_state: str, mutation_authorized: bool) -> JulesApiResult:
        if not mutation_authorized:
            return JulesApiResult(False, "JULES_API_MUTATION_NOT_AUTHORIZED")
        policy = continuation_policy_for_state(known_state)
        if policy != "SEND_MESSAGE_CAPABLE":
            return JulesApiResult(False, policy)
        if not prompt or not prompt.strip():
            return JulesApiResult(False, "JULES_API_REQUEST_INVALID")
        result = self._request("POST", f"/sessions/{urllib.parse.quote(str(session_id), safe='')}:sendMessage",
                               {"prompt": prompt}, read=False)
        if not result.ok and result.classification in {"JULES_API_PROVIDER_UNAVAILABLE", "JULES_API_RATE_LIMITED", "JULES_API_UNKNOWN_FAILURE"}:
            return JulesApiResult(False, "WRITE_OUTCOME_UNKNOWN", None, result.status_code, result.retry_after, result.request_id)
        return result

    def approve_plan(self, session_id: str, *, known_state: str, mutation_authorized: bool, contract_match: bool) -> JulesApiResult:
        if not mutation_authorized or not contract_match:
            return JulesApiResult(False, "JULES_API_PLAN_APPROVAL_NOT_AUTHORIZED")
        if normalize_session_state(known_state) != "AWAITING_PLAN_APPROVAL":
            return JulesApiResult(False, "JULES_API_PLAN_APPROVAL_STATE_MISMATCH")
        result = self._request("POST", f"/sessions/{urllib.parse.quote(str(session_id), safe='')}:approvePlan", {}, read=False)
        if not result.ok and result.classification in {"JULES_API_PROVIDER_UNAVAILABLE", "JULES_API_RATE_LIMITED", "JULES_API_UNKNOWN_FAILURE"}:
            return JulesApiResult(False, "WRITE_OUTCOME_UNKNOWN", None, result.status_code, result.retry_after, result.request_id)
        return result

    def create_session(self, spec: Mapping[str, Any], *, parent_authorized: bool, budget_gate: str) -> JulesApiResult:
        if not parent_authorized or budget_gate != "ALLOW":
            return JulesApiResult(False, "NEW_TASK_CREATION_NOT_AUTHORIZED")
        result = self._request("POST", "/sessions", spec, read=False)
        if not result.ok and result.classification in {"JULES_API_PROVIDER_UNAVAILABLE", "JULES_API_RATE_LIMITED", "JULES_API_UNKNOWN_FAILURE"}:
            return JulesApiResult(False, "WRITE_OUTCOME_UNKNOWN", None, result.status_code, result.retry_after, result.request_id)
        return result
