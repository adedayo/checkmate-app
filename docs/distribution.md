# Installing CheckMate

## macOS

```sh
brew install --cask adedayo/tap/checkmate-app
```

The cask verifies the download's SHA-256 and clears the quarantine flag for
you, so the app opens normally. If you install this way you can skip the rest
of this section.

Or download `CheckMate-macos-universal.dmg` from the
[latest release](https://github.com/adedayo/checkmate-app/releases/latest). The
build is universal — one download works on Apple Silicon and Intel.

### Why macOS complains, and what to do about it

CheckMate is ad-hoc signed, not Developer ID signed. Apple only issues
Developer ID certificates to members of its Developer Program, which costs $99
a year. CheckMate is free software given away for the community's benefit, and
it is not going to charge you — directly or indirectly — to fund a rent to
Apple for permission to do that. So on first launch macOS will say the app
"cannot be opened because Apple cannot check it for malicious software."

That message is about *provenance*, not about the file being damaged or
dangerous. Apple has not checked it because we have not paid Apple to check it.
Establish provenance yourself instead — this is stronger evidence than
notarisation, because it ties the artefact to the public build that produced
it:

```sh
# 1. Confirm the bytes are the bytes we published.
shasum -a 256 -c SHA256SUMS --ignore-missing

# 2. Confirm we published them, from our release workflow. (See "Verifying a
#    download" below for cosign.)
```

Then clear the quarantine attribute on the file you just verified:

```sh
xattr -d com.apple.quarantine ~/Downloads/CheckMate-macos-universal.dmg
# then, after dragging the app into /Applications:
xattr -dr com.apple.quarantine /Applications/CheckMate.app
```

> It has to be this way round. The disk image is built with `hdiutil -format
> UDZO`, so it mounts read-only at `/Volumes/CheckMate`; clearing the flag on
> the app *before* it reaches `/Applications` fails with `Read-only file
> system`. The Homebrew cask sidesteps this entirely by clearing the flag in
> `preflight`, while the bundle is still staged and writable in the Caskroom.
>
> If the `/Applications` command fails with `Operation not permitted` on every
> file, App Management protection is guarding the installed bundle. Use
> `sudo xattr -dr com.apple.quarantine /Applications/CheckMate.app`, or grant
> your terminal **System Settings → Privacy & Security → App Management** and
> retry.

> This is deliberately narrow. It removes a flag from **one file you have just
> verified**. It is not `sudo spctl --master-disable`, which turns Gatekeeper
> off for everything you will ever download, and which you should not run for
> this or any other application. If you would rather not touch the terminal,
> **System Settings → Privacy & Security → Open Anyway** grants the same
> per-application exception through the UI.

## Windows

```powershell
winget install Adedayo.CheckMate
```

Or download `CheckMate-windows-amd64-installer.exe` (or `-arm64-`), or the
portable `.zip` if you would rather not install anything.

## Linux

| Format | Use when |
|---|---|
| `.deb` | Debian, Ubuntu and derivatives — declares its GTK/WebKit dependencies |
| `.rpm` | Fedora, RHEL, openSUSE |
| `.AppImage` | Your distribution's WebKit is the wrong vintage, or you want no install at all |
| `.tar.gz` | You want to unpack it somewhere and manage dependencies yourself |

```sh
sudo apt install ./checkmate-app_2.2.0_amd64.deb
# or
sudo dnf install ./checkmate-app-2.2.0.x86_64.rpm
# or
chmod +x CheckMate-linux-amd64.AppImage && ./CheckMate-linux-amd64.AppImage
```

The tarball is a bare binary and will not start without `libgtk-3-0` and
`libwebkit2gtk-4.1-0`. The `.deb` and `.rpm` declare those, which is the
reason to prefer them.

## Container

```sh
docker run -v "$PWD":/scan -v checkmate-data:/data \
  ghcr.io/adedayo/checkmate-app:v2.2.0
```

`linux/amd64` and `linux/arm64`. Tags are `vX.Y.Z`, `vX.Y`, `sha-<short>` and
`latest`. Pin the version for anything you depend on. The image runs as a
non-root user; CheckMate reads source and writes a local SQLite database, and
has no need of root.

---

## Verifying a download

Every asset is checksummed and signed. Neither requires trusting this
repository's secrets: Sigstore signing is keyless, against the workflow's own
OIDC identity.

```sh
sha256sum -c SHA256SUMS --ignore-missing

cosign verify-blob \
  --certificate CheckMate-macos-universal.dmg.pem \
  --signature   CheckMate-macos-universal.dmg.sig \
  --certificate-identity-regexp '^https://github.com/adedayo/checkmate-app/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  CheckMate-macos-universal.dmg
```

For the container image:

```sh
gh attestation verify oci://ghcr.io/adedayo/checkmate-app:v2.2.0 --owner adedayo
```

Each release carries an SPDX SBOM. An image nobody can enumerate the contents
of is an image nobody can tell you is vulnerable.

## Reproducibility

Release builds build the repository exactly as committed. The
`github.com/adedayo/checkmate` dependency is pinned to a released version in
`go.mod`; no build step rewrites the module graph, and no dependency resolves
to a moving branch.

This changed in v2.2.0. Earlier releases ran `go mod edit` and
`go get github.com/adedayo/checkmate@main` during the build, which meant a
`v2.1.0` artefact did not identify the code inside it, two builds of the same
tag were not the same artefact, and any attestation over the result described
a dependency graph that existed only during that one CI run.
