package main

import (
	"strings"
	"testing"
)

// A release publishes artefacts for every platform at once. The bug this
// guards against was picking the first of them regardless of where the app was
// running, which offered macOS users an .rpm — a file macOS cannot install.
func TestSelectPlatformAsset(t *testing.T) {
	release := []string{
		"CheckMate-linux-amd64.AppImage",
		"CheckMate-linux-arm64.AppImage",
		"CheckMate-macos-universal.dmg",
		"CheckMate-windows-amd64-installer.exe",
		"CheckMate-windows-arm64-installer.exe",
		"SHA256SUMS",
		"checkmate-app-2.2.0.x86_64.rpm",
		"checkmate-app_2.2.0_amd64.deb",
	}

	cases := []struct {
		name   string
		assets []string
		goos   string
		goarch string
		want   string
	}{
		{"macOS takes the universal dmg, not the rpm", release, "darwin", "arm64", "CheckMate-macos-universal.dmg"},
		{"macOS on Intel takes the same universal dmg", release, "darwin", "amd64", "CheckMate-macos-universal.dmg"},
		{"Windows takes the installer for its own arch", release, "windows", "arm64", "CheckMate-windows-arm64-installer.exe"},
		{"Linux prefers the AppImage for its own arch", release, "linux", "arm64", "CheckMate-linux-arm64.AppImage"},
		{"Linux falls back to a package when no AppImage exists",
			[]string{"checkmate-app_2.2.0_amd64.deb", "checkmate-app-2.2.0.x86_64.rpm"},
			"linux", "amd64", "checkmate-app_2.2.0_amd64.deb"},
		{"x86_64 in an rpm name counts as amd64",
			[]string{"checkmate-app-2.2.0.x86_64.rpm"}, "linux", "amd64", "checkmate-app-2.2.0.x86_64.rpm"},
		{"an artefact for another arch is not offered",
			[]string{"CheckMate-windows-arm64-installer.exe"}, "windows", "amd64", ""},
		{"a release with nothing for this platform yields nothing",
			[]string{"CheckMate-macos-universal.dmg"}, "linux", "amd64", ""},
		{"checksums and signatures are not artefacts",
			[]string{"SHA256SUMS", "CheckMate-macos-universal.dmg.sig", "CheckMate-macos-universal.dmg.pem"},
			"darwin", "arm64", ""},
		{"an unknown platform yields nothing", release, "plan9", "amd64", ""},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := selectPlatformAsset(tc.assets, tc.goos, tc.goarch); got != tc.want {
				t.Errorf("selectPlatformAsset(%s/%s) = %q, want %q", tc.goos, tc.goarch, got, tc.want)
			}
		})
	}
}

func TestInstallGuidance(t *testing.T) {
	cmd, hint := installGuidance("darwin")
	if cmd != "brew install --cask adedayo/tap/checkmate-app" {
		t.Errorf("macOS should be pointed at the Homebrew cask, got %q", cmd)
	}
	// The cask clears the quarantine flag; a hand-installed .dmg does not, and
	// the app silently refuses to open. The hint has to carry the manual step
	// rather than imply Homebrew handles it however you installed.
	if !strings.Contains(hint, "xattr -dr com.apple.quarantine") {
		t.Errorf("macOS hint must give the manual quarantine command for .dmg installs, got %q", hint)
	}
	if cmd, _ := installGuidance("windows"); cmd != "winget install Adedayo.CheckMate" {
		t.Errorf("Windows should be pointed at winget, got %q", cmd)
	}
	// Linux has no single package manager, so a command would be wrong for
	// most users; the hint has to carry the guidance instead.
	cmd, hint = installGuidance("linux")
	if cmd != "" || hint == "" {
		t.Errorf("Linux should offer a hint and no command, got cmd=%q hint=%q", cmd, hint)
	}
}
