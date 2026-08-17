#!/usr/bin/env bash
set -euo pipefail

FROZEN='e8d85dfb9e0855e76711b5c4e7bbc8f36827d9cc'
TARGET_BRANCH='implementation/gs-final-public-w02-solutions-r1'
REQUEST="$BRIDGE_ROOT/payloads/ASSET_REQUEST.tsv"
SOLUTION_EVIDENCE="$CANDIDATE_DIR/tests/visual/solutions/evidence/final-public-w02"
PUBLIC_EVIDENCE="$CANDIDATE_DIR/test-results/w05-public-site-evidence"
RENDERED="$REPORT_DIR/rendered"
mkdir -p "$RENDERED"
required_solution=(w02-recognition-1440.png w02-booking-product-directions-context-1440.png w02-reference-unavailable-1440.png w02-reference-available-non-booking-commerce-1440.png w02-keyboard-focus.png w02-start-direct-handoff.png w02-escape-hatch-handoff.png w02-1440-selected-booking.png w02-768-selected-booking.png w02-430-selected-booking.png w02-390-selected-booking.png w02-1440-compare.png w02-768-compare.png w02-430-compare.png w02-390-compare.png)
for name in "${required_solution[@]}"; do [[ -s "$SOLUTION_EVIDENCE/$name" ]] || { echo "RENDERED_EVIDENCE_MISSING $name" >&2; exit 80; }; cp "$SOLUTION_EVIDENCE/$name" "$RENDERED/$name"; done
for width in 1440 768 430 390; do name="w02-${width}-start-selected-booking.png"; [[ -s "$PUBLIC_EVIDENCE/$name" ]] || { echo "INTEGRATED_START_EVIDENCE_MISSING $name" >&2; exit 81; }; cp "$PUBLIC_EVIDENCE/$name" "$RENDERED/integrated-${name}"; done
find "$RENDERED" -maxdepth 1 -type f -name '*.png' -printf '%f\n' | sort > "$REPORT_DIR/rendered-evidence-index.txt"
printf 'rendered_evidence\tPASS\t%s screenshots indexed\n' "$(wc -l < "$REPORT_DIR/rendered-evidence-index.txt" | tr -d ' ')" >> "$REPORT_DIR/validation-summary.tsv"

if [[ $(git -C "$CANDIDATE_DIR" rev-parse HEAD) != "$CANDIDATE_SHA" ]]; then echo 'CANDIDATE_SHA_CHANGED_AFTER_TESTS' >&2; exit 82; fi
if [[ $(git -C "$CANDIDATE_DIR" rev-parse HEAD^) != "$FROZEN" ]]; then echo 'CANDIDATE_PARENT_CHANGED_AFTER_TESTS' >&2; exit 83; fi
if [[ -n $(git -C "$CANDIDATE_DIR" status --porcelain --untracked-files=no) ]]; then echo 'TRACKED_CANDIDATE_WORKTREE_DIRTY_AFTER_TESTS' >&2; git -C "$CANDIDATE_DIR" status --porcelain --untracked-files=no >&2; exit 84; fi
while IFS=$'\t' read -r asset_id drive_id expected source_fetched destination payload_file source_size; do
  [[ "$asset_id" == 'asset_id' ]] && continue
  repository_sha=$(sha256sum "$CANDIDATE_DIR/$destination" | awk '{print $1}')
  if [[ "$expected" != "$source_fetched" || "$expected" != "$repository_sha" ]]; then echo "FINAL_REPOSITORY_ASSET_MISMATCH asset=$asset_id expected=$expected source=$source_fetched repository=$repository_sha" >&2; exit 85; fi
done < "$REQUEST"
printf 'asset_byte_proof_final\tPASS\t8/8 repository SHA256 values still canonical\n' >> "$REPORT_DIR/validation-summary.tsv"

remote_final=$(git -C "$GITHUB_WORKSPACE" ls-remote origin "refs/heads/$TARGET_BRANCH" | awk '{print $1}')
printf '%s\n' "$remote_final" > "$REPORT_DIR/final-target-drift-check-sha.txt"
if [[ "$remote_final" != "$FROZEN" ]]; then printf 'final_target_drift\tFAIL\texpected=%s actual=%s\n' "$FROZEN" "$remote_final" >> "$REPORT_DIR/validation-summary.tsv"; printf 'W02_TARGET_UNCHANGED\nFINAL_TARGET_DRIFT_BLOCKED expected=%s actual=%s\n' "$FROZEN" "$remote_final" > "$REPORT_DIR/push-result.txt"; printf 'NO\n' > "$REPORT_DIR/candidate-pushed.txt"; echo "FINAL_TARGET_DRIFT expected=$FROZEN actual=$remote_final" >&2; exit 86; fi
printf 'final_target_drift\tPASS\t%s\n' "$remote_final" >> "$REPORT_DIR/validation-summary.tsv"

set +e
push_output=$(git -C "$CANDIDATE_DIR" push origin "${CANDIDATE_SHA}:refs/heads/${TARGET_BRANCH}" 2>&1); push_rc=$?
set -e
printf '%s\n' "$push_output" > "$REPORT_DIR/github-push-output.txt"
if [[ $push_rc -eq 0 ]]; then
  live_sha=$(git -C "$GITHUB_WORKSPACE" ls-remote origin "refs/heads/$TARGET_BRANCH" | awk '{print $1}')
  if [[ "$live_sha" != "$CANDIDATE_SHA" ]]; then printf 'FAST_FORWARD_PUSH_POSTCHECK_MISMATCH expected=%s actual=%s\n' "$CANDIDATE_SHA" "$live_sha" > "$REPORT_DIR/push-result.txt"; printf 'UNKNOWN\n' > "$REPORT_DIR/candidate-pushed.txt"; echo "PUSH_POSTCHECK_MISMATCH expected=$CANDIDATE_SHA actual=$live_sha" >&2; exit 87; fi
  printf '%s\n' "$live_sha" > "$REPORT_DIR/resulting-live-pr72-sha.txt"; printf 'YES\n' > "$REPORT_DIR/candidate-pushed.txt"; printf 'FAST_FORWARD_PUSHED\n%s\n' "$push_output" > "$REPORT_DIR/push-result.txt"; printf 'transactional_push\tPASS\tFAST_FORWARD_PUSHED %s\n' "$live_sha" >> "$REPORT_DIR/validation-summary.tsv"
else
  live_sha=$(git -C "$GITHUB_WORKSPACE" ls-remote origin "refs/heads/$TARGET_BRANCH" | awk '{print $1}')
  printf '%s\n' "$live_sha" > "$REPORT_DIR/resulting-live-pr72-sha.txt"; printf 'NO\n' > "$REPORT_DIR/candidate-pushed.txt"
  { echo 'REMOTE_FAST_FORWARD_PUSH_BLOCKED'; echo 'W02_TARGET_UNCHANGED'; printf '%s\n' "$push_output"; } > "$REPORT_DIR/push-result.txt"
  printf 'transactional_push\tBLOCKED\tREMOTE_FAST_FORWARD_PUSH_BLOCKED live=%s\n' "$live_sha" >> "$REPORT_DIR/validation-summary.tsv"
fi
printf 'REFERENCE ONLY\n' > "$REPORT_DIR/evidence-classification.txt"
printf 'GS_GOV_W09_W02_REMOTE_EXECUTION_BRIDGE_HANDOFF_REQUIRED\n' > "$REPORT_DIR/stop-gate.txt"
