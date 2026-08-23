from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class MutationReceipt:
    operation_key: str
    timestamp: float
    target_session_id: str
    candidate_sha: str
    action_type: str
    response_status: str
    provider_operation_id: str | None = None


class ReceiptStore:
    """Secret-free operation receipt store used by shadow/canary logic."""

    def __init__(self, path: str | os.PathLike[str]):
        self.path = Path(path)

    def load(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        data = json.loads(self.path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []

    def contains(self, operation_key: str) -> bool:
        return any(item.get("operation_key") == operation_key for item in self.load())

    def append(self, receipt: MutationReceipt) -> None:
        values = self.load()
        if any(item.get("operation_key") == receipt.operation_key for item in values):
            return
        values.append(asdict(receipt))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix(self.path.suffix + ".tmp")
        temp.write_text(json.dumps(values, indent=2, sort_keys=True), encoding="utf-8")
        os.replace(temp, self.path)


class MutationLease:
    """Atomic same-run/process lease; GitHub concurrency supplies cross-run serialization."""

    def __init__(self, directory: str | os.PathLike[str], workstream: str):
        safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in workstream)
        self.path = Path(directory) / f"{safe}.lease"
        self.fd: int | None = None

    def acquire(self) -> bool:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self.fd = os.open(self.path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            os.write(self.fd, str(time.time()).encode("ascii"))
            return True
        except FileExistsError:
            return False

    def release(self) -> None:
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None
        try:
            self.path.unlink()
        except FileNotFoundError:
            pass


@dataclass
class CircuitBreaker:
    threshold: int = 2
    failures: int = 0
    open: bool = False

    def record(self, classification: str) -> None:
        hard_open = {"JULES_API_UNAUTHORIZED", "JULES_API_FORBIDDEN", "JULES_API_PROTOCOL_CHANGED", "JULES_API_RESPONSE_INVALID"}
        retryable = {"JULES_API_RATE_LIMITED", "JULES_API_PROVIDER_UNAVAILABLE", "WRITE_OUTCOME_UNKNOWN"}
        if classification in hard_open:
            self.open = True
            return
        if classification in retryable:
            self.failures += 1
            if self.failures >= self.threshold:
                self.open = True
        elif classification in {"OK", "JULES_API_READY"}:
            self.failures = 0
            self.open = False
