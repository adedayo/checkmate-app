cask "checkmate-app" do
  # sha256 is written by the release workflow. It is deliberately not
  # :no_check — the previous value of this field. :no_check tells Homebrew to
  # install whatever happens to be at the URL, which removes the only integrity
  # check in the macOS install path and is a strange thing for a security
  # scanner to ask its users to accept.
  version "2.1.0"
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"

  url "https://github.com/adedayo/checkmate-app/releases/download/v#{version}/CheckMate-macos-universal.dmg",
      verified: "github.com/adedayo/checkmate-app/"
  name "CheckMate App"
  desc "Local SAST & secret exposure intelligence desktop engine"
  homepage "https://github.com/adedayo/checkmate-app"

  livecheck do
    url :url
    strategy :github_latest
  end

  depends_on macos: ">= :catalina"

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
  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-dr", "com.apple.quarantine", "#{appdir}/CheckMate.app"],
                   sudo: false
  end

  zap trash: [
    "~/.checkmate",
    "~/Library/Application Support/CheckMate",
    "~/Library/Preferences/com.adedayo.checkmate.plist",
    "~/Library/Saved Application State/com.adedayo.checkmate.savedState",
    "~/Library/WebKit/com.adedayo.checkmate",
  ]
end
