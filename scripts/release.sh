#!/usr/bin/env bash
set -euo pipefail

# CheckMate — release cutter.
#
# This script does one thing that matters: it establishes that the tree is in a
# state worth tagging, then tags it. Everything after the tag is the workflow's
# job. The previous version of this script also rewrote AppVersion in app.go
# with sed, which duplicated a value the workflow separately stamped with
# ldflags — two sources of truth for one version, and nothing checking that
# they agreed. AppVersion now derives from pkg/version, so only the tag is
# authoritative.
#
# Usage:
#   ./scripts/release.sh v2.2.0
#   ./scripts/release.sh v2.2.0 --dry-run    # check everything, tag nothing

VERSION="${1:-}"
DRY_RUN=false
for arg in "${@:2}"; do
  case "${arg}" in
    --dry-run) DRY_RUN=true ;;
    *) echo "Unknown option: ${arg}" >&2; exit 1 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

die()  { echo "✖ $*" >&2; exit 1; }
step() { echo ""; echo "── $* ──"; }

# ─── Preconditions ──────────────────────────────────────────────────────────

[ -n "${VERSION}" ] || die "Version required. Usage: ./scripts/release.sh v2.2.0"

# Anchored, and permitting a prerelease suffix. The workflow keys its
# `prerelease` flag off the presence of a hyphen, so "v2.2.0-rc.1" is a
# supported input rather than an accident.
[[ "${VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]] \
  || die "Invalid version '${VERSION}'. Expected vMAJOR.MINOR.PATCH[-prerelease]."

git rev-parse --git-dir > /dev/null 2>&1 || die "Not a git repository."

# A dirty tree means the tag points at a commit that does not contain what was
# tested. Artefacts are built from the commit, not the working copy, so this is
# the difference between shipping what was verified and shipping something
# adjacent to it.
[ -z "$(git status --porcelain)" ] \
  || { git status --short >&2; die "Working tree is not clean."; }

git rev-parse "${VERSION}" > /dev/null 2>&1 \
  && die "Tag ${VERSION} already exists. Releases are immutable; choose a new version."

# go.work makes the build use ../checkmate instead of the pinned module. That is
# the right thing locally and precisely the wrong thing for a release: the
# resulting verification would not describe what CI is about to build.
[ ! -f go.work ] \
  || die "go.work is present. Remove it before releasing — it overrides the pinned checkmate dependency."

grep -q '^replace github.com/adedayo/checkmate' go.mod \
  && die "go.mod contains a replace directive for checkmate. Releases must build the tree as committed."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "${BRANCH}" != "main" ]; then
  echo "⚠ Releasing from '${BRANCH}', not 'main'."
  read -r -p "  Continue? [y/N] " reply
  [[ "${reply}" =~ ^[Yy]$ ]] || die "Aborted."
fi

step "Fetching remote state"
git fetch --tags --quiet origin
LOCAL="$(git rev-parse @)"
REMOTE="$(git rev-parse '@{u}' 2>/dev/null || echo "${LOCAL}")"
[ "${LOCAL}" = "${REMOTE}" ] \
  || die "Local branch differs from its upstream. Pull or push before releasing."

echo "✔ ${VERSION} is a valid, unused version on a clean, synchronised ${BRANCH}"

# ─── Verification ───────────────────────────────────────────────────────────

step "Test suite"
./test.sh

step "Packaging manifest validation"
./scripts/validate-packaging.sh

step "Build verification"
(cd frontend && npm run build > /dev/null)
go build -ldflags "-X checkmate-app/pkg/version.Version=${VERSION}" -o /tmp/checkmate-release-check .
/tmp/checkmate-release-check --version 2>/dev/null || true
rm -f /tmp/checkmate-release-check
echo "✔ frontend bundle and Go binary build at ${VERSION}"

# ─── Version bump ───────────────────────────────────────────────────────────
#
# The stripped form is what package metadata wants: npm and Wails both reject
# or mangle a leading "v", while git tags require it.
BARE="${VERSION#v}"

step "Bumping version metadata to ${VERSION}"

python3 - "$BARE" <<'PY'
import re, sys

version = sys.argv[1]

def bump(path, pattern, label):
    with open(path) as f:
        text = f.read()
    new, n = re.subn(pattern, lambda m: m.group(1) + '"%s"' % version, text, count=1)
    if n != 1:
        sys.exit(f"no {label} found in {path}")
    with open(path, "w") as f:
        f.write(new)
    print(f"  {path} -> {version}")

bump("frontend/package.json", r'("version"\s*:\s*)"[^"]*"', "version field")
bump("wails.json", r'("productVersion"\s*:\s*)"[^"]*"', "info.productVersion")
PY

# pkg/version.Version stays "dev" on purpose. It is what an unstamped local
# build should report, and a source tree claiming to be a release is exactly
# the confusion this change exists to remove.

# ─── Tag and push ───────────────────────────────────────────────────────────

if [ "${DRY_RUN}" = true ]; then
  step "Dry run — reverting version bump"
  git checkout -- frontend/package.json wails.json
  echo "✔ Everything that would gate ${VERSION} passed. Nothing was tagged."
  exit 0
fi

step "Committing and tagging"
git add frontend/package.json wails.json
git commit -m "build(release): ${VERSION}"
git tag -a "${VERSION}" -m "CheckMate ${VERSION}"

git push origin HEAD
git push origin "${VERSION}"

cat <<EOF

✔ ${VERSION} tagged and pushed.

  The Release workflow is now building macOS, Windows and Linux artefacts and
  the container image. Nothing is published unless every platform succeeds.

  Watch:   https://github.com/adedayo/checkmate-app/actions
  Release: https://github.com/adedayo/checkmate-app/releases/tag/${VERSION}
EOF
