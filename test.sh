#!/usr/bin/env bash
set -euo pipefail

# CheckMate — local test runner.
#
# This mirrors .github/workflows/release.yml's preconditions, so that a green
# run here means the release pipeline has a chance. A local check weaker than
# the remote one is worse than no local check, because it tells you that you
# are done when you are not.

STEP=0
step() {
  STEP=$((STEP + 1))
  echo ""
  echo "──────────────────────────────────────────────────────────────"
  echo "  [${STEP}] $1"
  echo "──────────────────────────────────────────────────────────────"
}

echo "=============================================================="
echo "            CheckMate — Local Test Runner                     "
echo "=============================================================="

step "Go — formatting"
UNFORMATTED="$(gofmt -l . | grep -v '^frontend/' || true)"
if [ -n "${UNFORMATTED}" ]; then
  echo "The following files are not gofmt-formatted. Run: gofmt -w ." >&2
  echo "${UNFORMATTED}" >&2
  exit 1
fi
echo "✔ gofmt clean"

step "Go — vet"
go vet ./...
echo "✔ vet clean"

step "Go — build"
go build ./...
echo "✔ builds"

step "Go — tests"
go test -count=1 ./...

# Checks only text a user reads: Go string literals, Angular templates and
# template literals, and the documents a user is pointed at. Comments keep the
# punctuation they were written with, because a check that flags a maintainer's
# prose is one people learn to ignore.
step "Prose — em dashes in user-visible text"
go run ./tools/prosecheck

step "Angular — unit tests"
(cd frontend && npm run test -- --watch=false)

step "Packaging — manifest validation"
./scripts/validate-packaging.sh

step "Angular — production bundle"
(cd frontend && npm run build > /dev/null)
echo "✔ production bundle builds"

echo ""
echo "=============================================================="
echo "  ✔ ALL CHECKS PASSED — READY TO COMMIT"
echo "=============================================================="
