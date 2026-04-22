#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

while IFS= read -r test_file; do
  echo "RUN ${test_file}"
  bash "$test_file"
done < <(find "$SCRIPT_DIR" -maxdepth 1 -name '*.test.sh' ! -name 'run-all-tests.test.sh' | sort)
