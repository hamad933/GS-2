from __future__ import annotations

from jules_client import JulesApiResult, JulesClient


class ExistingSessionJulesClient:
    """Compatibility facade that intentionally exposes no create-session capability."""

    def __init__(self, api_key: str | None = None, timeout: float = 15.0, **kwargs):
        self._client = JulesClient(api_key=api_key, timeout=timeout, **kwargs)

    @property
    def available(self) -> bool:
        return self._client.available

    def get_session(self, session_id: str | None) -> JulesApiResult:
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._client.get_session(session_id)

    def list_activities(self, session_id: str | None, page_size: int = 100, page_token: str | None = None) -> JulesApiResult:
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._client.list_activities(session_id, page_size=page_size, page_token=page_token)

    def send_safe_message(self, session_id: str | None, prompt: str, *, waiting_class: str,
                          operation_already_applied: bool, known_state: str = "AWAITING_USER_FEEDBACK") -> JulesApiResult:
        if waiting_class != "POLICY_RESOLVABLE":
            return JulesApiResult(False, "FAST_CONTROLLER_SEND_DENIED_NOT_POLICY_RESOLVABLE")
        if operation_already_applied:
            return JulesApiResult(False, "IDEMPOTENT_NOOP_ALREADY_APPLIED")
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._client.send_message(session_id, prompt, known_state=known_state, mutation_authorized=True)

    def approve_plan(self, session_id: str | None, *, plan_contract_match: bool,
                     operation_already_applied: bool, known_state: str = "AWAITING_PLAN_APPROVAL") -> JulesApiResult:
        if not plan_contract_match:
            return JulesApiResult(False, "FAST_CONTROLLER_PLAN_APPROVAL_DENIED_CONTRACT_MISMATCH")
        if operation_already_applied:
            return JulesApiResult(False, "IDEMPOTENT_NOOP_ALREADY_APPLIED")
        if not session_id:
            return JulesApiResult(False, "SOURCE_UNAVAILABLE_SESSION_ID_NOT_BOUND")
        return self._client.approve_plan(session_id, known_state=known_state,
                                         mutation_authorized=True, contract_match=plan_contract_match)
