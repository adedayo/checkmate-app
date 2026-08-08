# Releasing CheckMate

One command cuts a release. Everything after the tag is automated, and nothing
is published unless every platform builds.

```sh
./scripts/release.sh v2.2.0
```

To validate everything a release would check without tagging anything:

```sh
./scripts/release.sh v2.2.0 --dry-run
```

## What the script does

In order, stopping at the first failure:

1. Validates the version against `vMAJOR.MINOR.PATCH[-prerelease]`.
2. Refuses a dirty tree, an existing tag, or a branch out of sync with upstream.
3. **Refuses to release with `go.work` present, or with a `replace` directive
   for `checkmate` in `go.mod`.** Either would mean the verification it is
   about to run does not describe what CI will build.
4. Warns, and asks, if you are not on `main`.
5. Runs `./test.sh` and `./scripts/validate-packaging.sh`.
6. Rebuilds the frontend bundle and the Go binary.
7. Bumps `frontend/package.json` and `wails.json`.
8. Commits, creates an annotated tag, and pushes both.

It does not build artefacts and does not upload anything. That division is
deliberate: a script that tags *and* publishes has two failure modes that look
identical from the terminal, and the one that matters — a half-published
release — is hardest to undo.

`pkg/version.Version` is **not** bumped. Its default is `dev`, which is what an
unstamped local build should report. Release binaries get their version from
`-ldflags` at link time. The old `sed`-the-literal-in-`app.go` step is gone:
one version, one source.

## Local development against ../checkmate

```sh
cp go.work.example go.work
```

`go.work` is git-ignored and invisible to CI. It replaces the old committed
`replace github.com/adedayo/checkmate => ../checkmate`, which forced the
release pipeline to strip the directive and re-resolve to `@main` mid-build.
Remove it before releasing — `release.sh` refuses to run while it exists.

To move the pin:

```sh
go get github.com/adedayo/checkmate@v1.3.4
```

## What happens after the tag

`release.yml` fires on `v*` and produces:

| Platform | Artefacts |
|---|---|
| macOS | Universal `.dmg` and `.zip` |
| Windows | NSIS installer and portable `.zip`, `amd64` + `arm64` |
| Linux | `.tar.gz`, `.deb`, `.rpm`, `.AppImage`, `amd64` + `arm64` |
| Containers | `ghcr.io/adedayo/checkmate-app`, `linux/amd64` + `linux/arm64` |
| Every asset | `SHA256SUMS`, cosign signature and certificate, SPDX SBOM, SLSA provenance |

`publish` runs only if macOS, Windows, Linux and the container build all
succeed. Package-manager updates run after publication and may fail without
failing the release — a tap that fails to bump is an inconvenience; a release
withheld because of it is an outage.

## Testing a change to the pipeline

Do not test it by cutting a release. Dispatch the workflow with
`dry_run: true` (the default): it builds every platform, computes checksums,
signs everything, and publishes nothing. The checksums appear in the job
summary.

## Signing

CheckMate does not hold an Apple Developer Program membership and is not going
to buy one. Paying a platform vendor $99 a year for permission to give free
software away is not a cost this project will carry, and the thing that
membership buys — a claim about who built the artefact — we already provide,
better, for nothing: a keyless Sigstore signature bound to the release workflow
and publicly logged in Rekor, plus `SHA256SUMS`. Those always run and need no
secret.

The practical consequence: macOS builds are **ad-hoc signed, not notarised**.
Ad-hoc signing is not a substitute for notarisation and is not pretending to
be. It is there because arm64 refuses to execute an unsigned Mach-O, because
the keychain, TCC and the firewall key their per-app grants on a code identity,
and because it makes local tampering detectable with `codesign --verify`.
Users downloading the `.dmg` directly will see Gatekeeper's dialogue;
`docs/distribution.md` explains why and gives a per-file remedy. Homebrew users
see nothing, because the cask verifies the checksum and clears the quarantine
flag in a `postflight`.

The Developer ID and Authenticode paths remain wired in, guarded on secrets, in
case that position ever changes or a fork holds certificates.

| Secret | Effect when set |
|---|---|
| `APPLE_CERT_P12`, `APPLE_CERT_PASSWORD`, `APPLE_SIGNING_IDENTITY` | Developer ID signing of the `.app` and `.dmg`, replacing the ad-hoc signature |
| `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_APP_PASSWORD` | Notarisation and ticket stapling |
| `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD` | Authenticode signing with RFC 3161 timestamping |
| `HOMEBREW_TAP_GITHUB_TOKEN` | Automatic cask bumps in `adedayo/homebrew-tap` |
| `WINGET_GITHUB_TOKEN` | Automatic winget manifest submission |

If Developer ID signing succeeds but notarisation fails, the job fails. A
bundle carrying a Developer ID signature but no notarisation ticket is treated
by Gatekeeper much like an unsigned one, while looking to us as though it
shipped correctly.

## Rolling back

Tags are immutable and `release.sh` refuses to reuse one. To withdraw a bad
release, mark the GitHub release as a draft and cut a new patch version.
Deleting a published tag breaks anyone who has already pinned to it, including
Homebrew's `livecheck`.
