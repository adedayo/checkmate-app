#!/usr/bin/env bash
set -euo pipefail

# CheckMate — packaging manifest validation.
#
# Packaging defects have a characteristic shape: invisible locally, invisible
# in CI, and discovered by a user on a platform the author does not own, hours
# after a tag was pushed. The release workflow only runs on tags, so a cask
# pointing at an app bundle no build produces stays green until someone tries
# to install it — which is exactly what the previous cask did.
#
# This moves the cheap subset of those checks to a point before the tag. It
# does not build packages; it checks the inputs that would be used to.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

FAILURES=0
ok()   { echo "  ✔ $*"; }
fail() { echo "  ✖ $*" >&2; FAILURES=$((FAILURES + 1)); }

echo "Validating packaging manifests"

for f in \
  build/appicon.png \
  build/darwin/Info.plist \
  build/darwin/Info.dev.plist \
  build/windows/icon.ico \
  build/windows/info.json \
  build/windows/wails.exe.manifest \
  build/windows/installer/project.nsi \
  packaging/linux/nfpm.yaml \
  packaging/linux/checkmate-app.desktop \
  packaging/homebrew/checkmate-app.rb \
  packaging/scoop/checkmate-app.json \
  .github/workflows/release.yml \
  .nvmrc \
  Dockerfile
do
  [ -f "$f" ] && ok "$f" || fail "missing: $f"
done

python3 - <<'PY' || exit 1
import json, re, sys

failures = 0

def check(label, fn):
    global failures
    try:
        fn()
        print(f"  ✔ {label}")
    except Exception as e:
        print(f"  ✖ {label}: {e}", file=sys.stderr)
        failures += 1

check("build/windows/info.json is valid JSON",
      lambda: json.load(open("build/windows/info.json")))
check("packaging/scoop/checkmate-app.json is valid JSON",
      lambda: json.load(open("packaging/scoop/checkmate-app.json")))
check("wails.json is valid JSON",
      lambda: json.load(open("wails.json")))

# The plists are Go templates and so are not parseable as plists. Checking that
# the delimiters balance catches the realistic failure — a hand-edit dropping a
# brace. The identifier checks read <string> values rather than raw text,
# because both files discuss the com.wails.* default in a comment explaining
# why it is not used, and a check that cannot distinguish an explanation from a
# defect gets silenced rather than fixed.
def plist_templates():
    for p in ("build/darwin/Info.plist", "build/darwin/Info.dev.plist"):
        text = open(p).read()
        if text.count("{{") != text.count("}}"):
            raise ValueError(f"{p}: unbalanced template delimiters")
        values = re.findall(r"<string>(.*?)</string>", text, re.DOTALL)
        if any(v.startswith("com.wails.") for v in values):
            raise ValueError(f"{p}: still uses the com.wails.* default bundle identifier")
        if not any(v.startswith("com.adedayo.checkmate") for v in values):
            raise ValueError(f"{p}: missing the com.adedayo.checkmate bundle identifier")
check("darwin plists are templated and correctly identified", plist_templates)

# The specific defect this catches: the cask used to declare
# app "checkmate-app.app" while wails.json produces CheckMate.app, so the cask
# could never have linked the application it installed.
def cask():
    text = open("packaging/homebrew/checkmate-app.rb").read()
    if re.search(r"^\s*sha256\s+:no_check", text, re.MULTILINE):
        raise ValueError("cask uses sha256 :no_check, which disables integrity verification")
    if not re.search(r'^\s*sha256\s+"[0-9a-f]{64}"', text, re.MULTILINE):
        raise ValueError("cask has no 64-character sha256 placeholder or value")

    expected = json.load(open("wails.json"))["outputfilename"]
    m = re.search(r'^\s*app\s+"([^"]+)"', text, re.MULTILINE)
    if not m:
        raise ValueError("cask declares no app stanza")
    if m.group(1) != f"{expected}.app":
        raise ValueError(
            f"cask installs {m.group(1)!r} but wails builds {expected}.app"
        )
check("homebrew cask verifies and installs what wails builds", cask)

# The reproducibility rule, asserted rather than documented. This is the defect
# that made every previous release un-attestable.
def reproducible():
    gomod = open("go.mod").read()
    if re.search(r"^replace\s+github.com/adedayo/checkmate", gomod, re.MULTILINE):
        raise ValueError("go.mod replaces checkmate; releases must build the tree as committed")
    if not re.search(r"github.com/adedayo/checkmate\s+v\d+\.\d+\.\d+", gomod):
        raise ValueError("checkmate is not pinned to a released version in go.mod")

    for p in ("Dockerfile", ".github/workflows/release.yml"):
        for line in open(p):
            stripped = line.strip()
            if stripped.startswith("#"):
                continue  # commentary explaining why this is gone
            if "go mod edit" in stripped or "checkmate@main" in stripped:
                raise ValueError(f"{p}: still rewrites the module graph at build time")
check("release builds are reproducible", reproducible)

def nfpm_binary_matches_wails():
    try:
        import yaml
    except ImportError:
        print("  ~ PyYAML not installed; skipping nfpm check")
        return
    d = yaml.safe_load(open("packaging/linux/nfpm.yaml"))
    for key in ("name", "arch", "version", "contents", "depends"):
        if key not in d:
            raise ValueError(f"missing key: {key}")
    expected = json.load(open("wails.json"))["outputfilename"]
    src = d["contents"][0]["src"]
    if not src.endswith(expected):
        raise ValueError(f"nfpm source {src!r} does not match wails outputfilename {expected!r}")
check("nfpm manifest is coherent with wails.json", nfpm_binary_matches_wails)

def desktop_entry():
    text = open("packaging/linux/checkmate-app.desktop").read()
    for key in ("Type=", "Name=", "Exec=", "Icon="):
        if key not in text:
            raise ValueError(f"missing {key}")
check("linux desktop entry has the required keys", desktop_entry)

try:
    import yaml
    def workflow():
        d = yaml.safe_load(open(".github/workflows/release.yml"))
        if not d.get("jobs"):
            raise ValueError("no jobs defined")
    check("release workflow is valid YAML", workflow)
except ImportError:
    print("  ~ PyYAML not installed; skipping YAML checks")

sys.exit(1 if failures else 0)
PY

if [ "${FAILURES}" -ne 0 ]; then
  echo "" >&2
  echo "✖ ${FAILURES} packaging problem(s)." >&2
  exit 1
fi

echo "✔ packaging manifests validate"
