#!/usr/bin/env bash
set -euo pipefail

GOV_PARENT='7a0468ff298db068d018751acef8ae4693b5a816'
FROZEN='e8d85dfb9e0855e76711b5c4e7bbc8f36827d9cc'
STACKED_BASE='19e9096d714cfaa0055cfa1ccc794ca26320a2c5'
TARGET_BRANCH='implementation/gs-final-public-w02-solutions-r1'
BRIDGE_ROOT="$GITHUB_WORKSPACE/governance/remote-execution/w02"
REQUEST="$BRIDGE_ROOT/payloads/ASSET_REQUEST.tsv"
WORK_ROOT="$RUNNER_TEMP/gs-w02-remote-execution"
RECONSTRUCTED="$WORK_ROOT/reconstructed"
REPORT_DIR="$WORK_ROOT/report"
CANDIDATE_DIR="$WORK_ROOT/candidate"

rm -rf "$WORK_ROOT"
mkdir -p "$RECONSTRUCTED" "$REPORT_DIR"
printf 'check\tresult\tdetail\n' > "$REPORT_DIR/validation-summary.tsv"
printf 'asset_id\tdrive_id\texpected_sha256\tsource_fetched_sha256\treconstructed_actions_sha256\trepository_file_sha256\tequality\n' > "$REPORT_DIR/asset-sha256-proof.tsv"

actual_bridge_sha=$(git -C "$GITHUB_WORKSPACE" rev-parse HEAD)
if [[ "$actual_bridge_sha" != "$GITHUB_SHA" ]]; then echo "BRIDGE_CHECKOUT_SHA_MISMATCH expected=$GITHUB_SHA actual=$actual_bridge_sha" >&2; exit 11; fi
if ! git -C "$GITHUB_WORKSPACE" cat-file -e "${GOV_PARENT}^{commit}"; then git -C "$GITHUB_WORKSPACE" fetch --no-tags origin "$GOV_PARENT"; fi
merge_base=$(git -C "$GITHUB_WORKSPACE" merge-base "$GOV_PARENT" HEAD)
if [[ "$merge_base" != "$GOV_PARENT" ]]; then echo "BRIDGE_GOVERNANCE_PARENT_MISMATCH expected=$GOV_PARENT actual_merge_base=$merge_base" >&2; exit 12; fi
if git -C "$GITHUB_WORKSPACE" diff --name-only "$GOV_PARENT..HEAD" | grep -Ev '^(\.github/workflows/gs-w02-remote-execution-bridge\.yml|governance/remote-execution/w02/|docs/governance/GS_GOV_W09_W02_REMOTE_EXECUTION_BRIDGE_R1\.md)$' | grep -q .; then
  echo 'BRIDGE_PATH_BOUNDARY_VIOLATION' >&2; git -C "$GITHUB_WORKSPACE" diff --name-only "$GOV_PARENT..HEAD" >&2; exit 13
fi
printf 'bridge_exact_checkout\tPASS\t%s\n' "$actual_bridge_sha" >> "$REPORT_DIR/validation-summary.tsv"
printf 'governance_parent\tPASS\t%s\n' "$GOV_PARENT" >> "$REPORT_DIR/validation-summary.tsv"

remote_preflight=$(git -C "$GITHUB_WORKSPACE" ls-remote origin "refs/heads/$TARGET_BRANCH" | awk '{print $1}')
printf '%s\n' "$remote_preflight" > "$REPORT_DIR/frozen-w02-preflight-sha.txt"
if [[ "$remote_preflight" != "$FROZEN" ]]; then printf 'w02_preflight\tFAIL\texpected=%s actual=%s\n' "$FROZEN" "$remote_preflight" >> "$REPORT_DIR/validation-summary.tsv"; echo "W02_PREFLIGHT_DRIFT expected=$FROZEN actual=$remote_preflight" >&2; exit 20; fi
printf 'w02_preflight\tPASS\t%s\n' "$remote_preflight" >> "$REPORT_DIR/validation-summary.tsv"

git -C "$GITHUB_WORKSPACE" fetch --no-tags origin "+refs/heads/$TARGET_BRANCH:refs/remotes/origin/$TARGET_BRANCH"
if [[ $(git -C "$GITHUB_WORKSPACE" rev-parse "refs/remotes/origin/$TARGET_BRANCH") != "$FROZEN" ]]; then echo 'W02_FETCHED_REMOTE_MISMATCH' >&2; exit 21; fi
if ! git -C "$GITHUB_WORKSPACE" cat-file -e "${STACKED_BASE}^{commit}"; then git -C "$GITHUB_WORKSPACE" fetch --no-tags origin "$STACKED_BASE"; fi

while IFS=$'\t' read -r asset_id drive_id expected source_fetched destination payload_file source_size; do
  [[ "$asset_id" == 'asset_id' ]] && continue
  if [[ "$source_fetched" != "$expected" ]]; then echo "SOURCE_FETCHED_AUTHORITY_MISMATCH asset=$asset_id expected=$expected source=$source_fetched" >&2; exit 30; fi
  payload="$BRIDGE_ROOT/payloads/$payload_file"; output="$RECONSTRUCTED/${asset_id}.webp"
  if [[ -f "$payload" ]]; then
    base64 --decode "$payload" > "$output"
  else
    shopt -s nullglob
    chunks=("$payload".part-*)
    shopt -u nullglob
    if [[ ${#chunks[@]} -eq 0 ]]; then echo "PAYLOAD_MISSING asset=$asset_id payload=$payload" >&2; exit 31; fi
    cat "${chunks[@]}" | base64 --decode > "$output"
  fi
  reconstructed=$(sha256sum "$output" | awk '{print $1}'); actual_size=$(wc -c < "$output" | tr -d ' ')
  if [[ "$reconstructed" != "$expected" || "$actual_size" != "$source_size" ]]; then echo "RECONSTRUCTED_ASSET_MISMATCH asset=$asset_id expected_sha=$expected actual_sha=$reconstructed expected_size=$source_size actual_size=$actual_size" >&2; exit 32; fi
done < "$REQUEST"
printf 'asset_reconstruction\tPASS\t8/8 canonical SHA256 values matched\n' >> "$REPORT_DIR/validation-summary.tsv"

git -C "$GITHUB_WORKSPACE" worktree add --detach "$CANDIDATE_DIR" "$FROZEN"
if [[ $(git -C "$CANDIDATE_DIR" rev-parse HEAD) != "$FROZEN" ]]; then echo 'CANDIDATE_PARENT_CHECKOUT_MISMATCH' >&2; exit 40; fi
while IFS=$'\t' read -r asset_id drive_id expected source_fetched destination payload_file source_size; do
  [[ "$asset_id" == 'asset_id' ]] && continue
  mkdir -p "$CANDIDATE_DIR/$(dirname "$destination")"; cp "$RECONSTRUCTED/${asset_id}.webp" "$CANDIDATE_DIR/$destination"
done < "$REQUEST"
(cd "$CANDIDATE_DIR"; python3 "$BRIDGE_ROOT/scripts/apply_w02_m01.py")

grep -Fq 'const reference = family.reference;' "$CANDIDATE_DIR/src/features/solutions/SolutionsExploration.tsx"
git -C "$CANDIDATE_DIR" diff --quiet "$FROZEN" -- src/data/solutions src/data/reference-projects src/features/reference-projects tests/visual/public-semantics/public-semantics.spec.ts tests/visual/reference-projects/reference-projects.visual.spec.ts
printf 'M02_preservation\tPASS\tfamily.reference preserved; reference/public-semantic contracts untouched\n' >> "$REPORT_DIR/validation-summary.tsv"

git -C "$CANDIDATE_DIR" diff --quiet "$FROZEN" -- tests/visual/route-performance/route-performance.spec.ts tests/visual/public-semantics/public-semantics.spec.ts tests/visual/reference-projects/reference-projects.visual.spec.ts
grep -Fq 'expect(metrics.contrast).toBeGreaterThanOrEqual(4.5);' "$CANDIDATE_DIR/tests/visual/route-performance/route-performance.spec.ts"
grep -Fq "test('preserves exact RP identities, independent state, and absent outbound routes'" "$CANDIDATE_DIR/tests/visual/public-semantics/public-semantics.spec.ts"
grep -Fq "test('all four references support pointer focus and contextual expansion'" "$CANDIDATE_DIR/tests/visual/reference-projects/reference-projects.visual.spec.ts"
printf 'M03_preservation\tPASS\treference assertions byte-identical; normal-text contrast guard >=4.5 preserved\n' >> "$REPORT_DIR/validation-summary.tsv"

while IFS=$'\t' read -r asset_id drive_id expected source_fetched destination payload_file source_size; do
  [[ "$asset_id" == 'asset_id' ]] && continue
  reconstructed=$(sha256sum "$RECONSTRUCTED/${asset_id}.webp" | awk '{print $1}'); repository_sha=$(sha256sum "$CANDIDATE_DIR/$destination" | awk '{print $1}'); equality='EQUAL'
  if [[ "$expected" != "$source_fetched" || "$expected" != "$reconstructed" || "$expected" != "$repository_sha" ]]; then equality='MISMATCH'; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$asset_id" "$drive_id" "$expected" "$source_fetched" "$reconstructed" "$repository_sha" "$equality" >> "$REPORT_DIR/asset-sha256-proof.tsv"
  if [[ "$equality" != 'EQUAL' ]]; then echo "ASSET_BYTE_PROOF_FAILED asset=$asset_id" >&2; exit 50; fi
done < "$REQUEST"
printf 'asset_byte_proof_precommit\tPASS\texpected=source=reconstructed=repository for 8/8 assets\n' >> "$REPORT_DIR/validation-summary.tsv"

cat > "$REPORT_DIR/m01-binding-proof.txt" <<'PROOF'
FAM-01 recognition = FAM-01-EMB-01
FAM-02 recognition = FAM-02-EMB-01
FAM-03 recognition = FAM-03-EMB-01
FAM-04 recognition = FAM-04-EMB-01
FAM-05 recognition = FAM-05-EMB-01
FAM-06 recognition = FAM-06-EMB-01
selected Booking Product Scene = FAM-03-MSC-01
Booking Compare = FAM-03-CMP-01
Operations Compare = FAM-05-CMP-01
DIR roles = unchanged
CTX roles = unchanged
PROOF
cat > "$REPORT_DIR/allowed-changed-paths.txt" <<'PATHS'
src/assets/gs-public-v1/families/FAM-01/EMBLEM/FAM-01-EMB-01.webp
src/assets/gs-public-v1/families/FAM-02/EMBLEM/FAM-02-EMB-01.webp
src/assets/gs-public-v1/families/FAM-03/COMPARE/FAM-03-CMP-01.webp
src/assets/gs-public-v1/families/FAM-03/EMBLEM/FAM-03-EMB-01.webp
src/assets/gs-public-v1/families/FAM-04/EMBLEM/FAM-04-EMB-01.webp
src/assets/gs-public-v1/families/FAM-05/COMPARE/FAM-05-CMP-01.webp
src/assets/gs-public-v1/families/FAM-05/EMBLEM/FAM-05-EMB-01.webp
src/assets/gs-public-v1/families/FAM-06/EMBLEM/FAM-06-EMB-01.webp
src/data/visual/familyVisualAssets.ts
src/features/solutions/SolutionsExploration.tsx
tests/visual/solutions/solutions-workspace.visual.spec.ts
PATHS

git -C "$CANDIDATE_DIR" status --porcelain --untracked-files=all | sed 's/^...//' | sort > "$REPORT_DIR/precommit-changed-paths.txt"
if ! diff -u "$REPORT_DIR/allowed-changed-paths.txt" "$REPORT_DIR/precommit-changed-paths.txt"; then echo 'W02_CHANGED_PATH_BOUNDARY_FAILED' >&2; exit 60; fi
printf 'changed_path_boundary\tPASS\t11 exact authorized paths\n' >> "$REPORT_DIR/validation-summary.tsv"
(
  cd "$CANDIDATE_DIR"
  git add -- src/assets/gs-public-v1/families/FAM-01/EMBLEM/FAM-01-EMB-01.webp src/assets/gs-public-v1/families/FAM-02/EMBLEM/FAM-02-EMB-01.webp src/assets/gs-public-v1/families/FAM-03/EMBLEM/FAM-03-EMB-01.webp src/assets/gs-public-v1/families/FAM-04/EMBLEM/FAM-04-EMB-01.webp src/assets/gs-public-v1/families/FAM-05/EMBLEM/FAM-05-EMB-01.webp src/assets/gs-public-v1/families/FAM-06/EMBLEM/FAM-06-EMB-01.webp src/assets/gs-public-v1/families/FAM-03/COMPARE/FAM-03-CMP-01.webp src/assets/gs-public-v1/families/FAM-05/COMPARE/FAM-05-CMP-01.webp src/data/visual/familyVisualAssets.ts src/features/solutions/SolutionsExploration.tsx tests/visual/solutions/solutions-workspace.visual.spec.ts
  git config user.name 'GS Governance Remote Bridge'; git config user.email 'governance-actions@users.noreply.github.com'
  git commit -m 'fix(solutions): bind governed W02 emblem and compare assets'
)
candidate_sha=$(git -C "$CANDIDATE_DIR" rev-parse HEAD); candidate_parent=$(git -C "$CANDIDATE_DIR" rev-parse HEAD^)
if [[ "$candidate_parent" != "$FROZEN" ]]; then echo "CANDIDATE_DIRECT_PARENT_MISMATCH expected=$FROZEN actual=$candidate_parent" >&2; exit 70; fi
git -C "$CANDIDATE_DIR" diff-tree --no-commit-id --name-only -r HEAD | sort > "$REPORT_DIR/changed-paths.txt"
if ! diff -u "$REPORT_DIR/allowed-changed-paths.txt" "$REPORT_DIR/changed-paths.txt"; then echo 'CANDIDATE_COMMIT_PATH_BOUNDARY_FAILED' >&2; exit 71; fi
printf '%s\n' "$candidate_sha" > "$REPORT_DIR/candidate-sha.txt"; printf '%s\n' "$FROZEN" > "$REPORT_DIR/frozen-source-sha.txt"; printf '%s\n' "$STACKED_BASE" > "$REPORT_DIR/stacked-base-sha.txt"
printf 'candidate_parent\tPASS\t%s\n' "$candidate_parent" >> "$REPORT_DIR/validation-summary.tsv"; printf 'candidate_commit\tPASS\t%s\n' "$candidate_sha" >> "$REPORT_DIR/validation-summary.tsv"
{
  echo "BRIDGE_ROOT=$BRIDGE_ROOT"; echo "REPORT_DIR=$REPORT_DIR"; echo "CANDIDATE_DIR=$CANDIDATE_DIR"; echo "CANDIDATE_SHA=$candidate_sha"; echo "FROZEN_W02_SHA=$FROZEN"; echo "STACKED_BASE_SHA=$STACKED_BASE"; echo "TARGET_W02_BRANCH=$TARGET_BRANCH"
} >> "$GITHUB_ENV"
echo "CANDIDATE_SHA=$candidate_sha"
