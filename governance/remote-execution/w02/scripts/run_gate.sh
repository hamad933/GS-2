#!/usr/bin/env bash
set -uo pipefail
name=${1:?gate name required}
shift
set +e
"$@"
rc=$?
set -e
if [[ $rc -eq 0 ]]; then
  result='PASS'
else
  result='FAIL'
fi
printf '%s\t%s\texit=%s\n' "$name" "$result" "$rc" >> "$REPORT_DIR/validation-summary.tsv"
exit "$rc"
