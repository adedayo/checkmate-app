cask "checkmate-app" do
  # sha256 is written by the release workflow. It is deliberately not
  # :no_check — the previous value of this field. :no_check tells Homebrew to
  # install whatever happens to be at the URL, which removes the only integrity
  # check in the macOS install path and is a strange thing for a security
  # scanner to ask its users to accept.
  version "2.1.0"
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"

  # No `verified:` parameter. It is deprecated: it existed to assert that a URL
  # whose host differs from the homepage is nevertheless the right one, and
  # Homebrew now derives that itself. Keeping it only produced a warning on
  # every command that touched this cask.
  url "https://github.com/adedayo/checkmate-app/releases/download/v#{version}/CheckMate-macos-universal.dmg"
  name "CheckMate App"
  desc "Local SAST & secret exposure intelligence desktop engine"
  homepage "https://github.com/adedayo/checkmate-app"

  livecheck do
    url :url
    strategy :github_latest
  end

  # There is deliberately no *versioned* `depends_on macos:` stanza. Homebrew
  # 6.0.22 *disabled* `depends_on macos: :catalina` outright — "There is no
  # replacement" — and the string form `">= :catalina"` before it. Declaring
  # either is now a hard error that makes the cask uninstallable, which is how
  # it reached a user: `brew install --cask adedayo/tap/checkmate-app` aborted
  # with "Calling `depends_on macos: :catalina` is disabled!".
  #
  # Nothing is lost by dropping the version. The stanza only ever produced a
  # nicer message on macOS versions older than Catalina; the .dmg is a
  # universal 64-bit bundle those releases could not run regardless, and
  # Homebrew itself no longer supports them.
  #
  # The unversioned form below is still supported, and is required: `brew
  # style` flags a cask with a macOS-only artifact that omits it.
  depends_on :macos

  # CheckMate.app, matching outputfilename in wails.json. The previous value
  # was "checkmate-app.app", which no build has ever produced — the cask would
  # have failed to link on install.
  app "CheckMate.app"

  # CheckMate is ad-hoc signed, not notarised — see docs/distribution.md for why
  # we decline to pay Apple to give free software away. Homebrew has already
  # done the thing notarisation is a proxy for: it verified the download against
  # the sha256 above before we got here. Clearing the quarantine flag on that
  # verified bundle is therefore not a weakening of the install; it just stops
  # Gatekeeper re-asking a question Homebrew answered with better evidence.
  #
  # Scoped to this bundle only. Nothing here touches system-wide policy, which
  # is why it is `-dr ... CheckMate.app` and not `xattr -cr` on anything wider.
  #
  # This runs in `postflight`, against the installed bundle, and not in
  # `preflight` against "#{staged_path}/CheckMate.app" — the previous form,
  # which did nothing observable. Homebrew propagates the quarantine attribute
  # from the downloaded .dmg onto the app as part of *installing* the artifact,
  # which happens after preflight has run. Clearing the flag on the staged copy
  # therefore cleared a flag that was about to be re-applied, and users who
  # installed with the cask still had to run xattr by hand.
  #
  # `postflight_steps` and not `postflight`: the arbitrary-Ruby `postflight`
  # block is deprecated in Homebrew 6 and slated for the same removal that just
  # turned `depends_on macos:` into an error. `postflight_steps` is the
  # declarative replacement — a list of vetted operations that Homebrew can run
  # inside a sandbox, rather than a block of tap-supplied code.
  #
  # `{{appdir}}` is a template token expanded by Homebrew at install time; it
  # cannot be written as `#{appdir}` here because the steps block is evaluated
  # before any cask paths exist.
  #
  # `must_succeed: false` because a bundle carrying no such attribute — a
  # future notarised build, or a re-run of this block — must not turn a
  # successful install into a failed one.
  postflight_steps do
    run "/usr/bin/xattr",
        args:         ["-dr", "com.apple.quarantine", "{{appdir}}/CheckMate.app"],
        must_succeed: false
  end

  zap trash: [
    "~/.checkmate",
    "~/Library/Application Support/CheckMate",
    "~/Library/Preferences/com.adedayo.checkmate.plist",
    "~/Library/Saved Application State/com.adedayo.checkmate.savedState",
    "~/Library/WebKit/com.adedayo.checkmate",
  ]
end
