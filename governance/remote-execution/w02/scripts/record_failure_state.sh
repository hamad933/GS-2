#!/usr/bin/env bash
set -euo pipefail
mkdir -p "${REPORT_DIR:-$RUNNER_TEMP/gs-w02-remote-execution/report}"
REPORT_DIR=${REPORT_DIR:-$RUNNER_TEMP/gs-w02-remote-execution/report}
TARGET_BRANCH='implementation/gs-final-public-w02-solutions-r1'
live=$(git -C "$GITHUB_WORKSPACE" ls-remote origin "refs/heads/$TARGET_BRANCH" | awk '{print $1}')
printf '%s\n' "$live" > "$REPORT_DIR/resulting-live-pr72-sha.txt"
if [[ ! -f "$REPORT_DIR/final-target-drift-check-sha.txt" ]]; then printf '%s\n' "$live" > "$REPORT_DIR/final-target-drift-check-sha.txt"; fi
if [[ ! -f "$REPORT_DIR/candidate-pushed.txt" ]]; then printf 'NO\n' > "$REPORT_DIR/candidate-pushed.txt"; fi
if [[ ! -f "$REPORT_DIR/push-result.txt" ]]; then printf 'W02_TARGET_UNCHANGED\nREMOTE_TRANSACTION_VALIDATION_FAILED_BEFORE_PUBLICATION\n' > "$REPORT_DIR/push-result.txt"; fi
printf 'REFERENCE ONLY\n' > "$REPORT_DIR/evidence-classification.txt"
printf 'GS_GOV_W09_W02_REMOTE_EXECUTION_BRIDGE_HANDOFF_REQUIRED\n' > "$REPORT_DIR/stop-gate.txt"
