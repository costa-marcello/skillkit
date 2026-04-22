#!/usr/bin/env bash
# Bisection script to find which test creates unwanted files/state.
# Usage: ./find-polluter.sh <file_or_dir_to_check> <test_name_pattern> [root_dir]
# Example: ./find-polluter.sh '.git' '*.test.ts' src
#
# Arguments:
#   file_to_check      Path to watch for. If it appears after a test runs, that test is the polluter.
#   test_name_pattern  Filename glob passed to `find -name` (e.g. '*.test.ts', '*_spec.rb').
#   root_dir           Directory to search for test files. Defaults to '.'.

set -euo pipefail

if [ $# -lt 2 ] || [ $# -gt 3 ]; then
  echo "Usage: $0 <file_to_check> <test_name_pattern> [root_dir]" >&2
  echo "Example: $0 '.git' '*.test.ts' src" >&2
  exit 1
fi

POLLUTION_CHECK="$1"
TEST_PATTERN="$2"
ROOT_DIR="${3:-.}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "[ERROR] Root directory does not exist: $ROOT_DIR" >&2
  exit 1
fi

echo "[INFO] Searching for test that creates: $POLLUTION_CHECK"
echo "[INFO] Test name pattern: $TEST_PATTERN (under $ROOT_DIR)"
echo ""

# Collect test files matching the pattern, excluding node_modules.
TEST_FILES=$(find "$ROOT_DIR" -type f -name "$TEST_PATTERN" -not -path '*/node_modules/*' | sort)

if [ -z "$TEST_FILES" ]; then
  echo "[ERROR] No test files matched '$TEST_PATTERN' under $ROOT_DIR" >&2
  exit 1
fi

TOTAL=$(printf '%s\n' "$TEST_FILES" | wc -l | tr -d ' ')
echo "[INFO] Found $TOTAL test files"
echo ""

# Fail fast if pollution already exists before we start.
if [ -e "$POLLUTION_CHECK" ]; then
  echo "[ERROR] Pollution already exists before any test ran: $POLLUTION_CHECK" >&2
  echo "        Remove it first, then re-run this script." >&2
  exit 1
fi

COUNT=0
while IFS= read -r TEST_FILE; do
  COUNT=$((COUNT + 1))
  echo "[$COUNT/$TOTAL] Testing: $TEST_FILE"

  # Run the test. Allow failure so we can continue bisecting.
  npm test "$TEST_FILE" > /dev/null 2>&1 || true

  if [ -e "$POLLUTION_CHECK" ]; then
    echo ""
    echo "[FOUND] Polluter identified:"
    echo "        Test: $TEST_FILE"
    echo "        Created: $POLLUTION_CHECK"
    echo ""
    echo "Pollution details:"
    ls -la "$POLLUTION_CHECK"
    echo ""
    echo "To investigate:"
    echo "  npm test $TEST_FILE    # Run just this test"
    echo "  cat $TEST_FILE         # Review test code"
    exit 1
  fi
done <<< "$TEST_FILES"

echo ""
echo "[OK] No polluter found. All tests ran without creating $POLLUTION_CHECK."
exit 0
