// Package version is the single source of truth for the build identity of the
// CheckMate desktop application.
//
// This exists rather than a `var AppVersion` in package main because
// `-X main.AppVersion` can only reach one binary, and the value is needed by
// the application, the API server it embeds, and the report generator that
// stamps its output. A version declared in one place and copied to three is a
// version that will eventually disagree with itself.
package version

import (
	"fmt"
	"runtime"
	"runtime/debug"
	"strings"
	"sync"
)

// These are set at link time. See LDFlags for the canonical stamping string.
//
// go build -ldflags "-X checkmate-app/pkg/version.Version=v2.2.0"
var (
	// Version is the release tag, e.g. "v2.2.0". "dev" in an unstamped build.
	Version = "dev"

	// Commit is the short git SHA the artefact was built from.
	Commit = ""

	// BuildDate is an RFC 3339 UTC timestamp of the build.
	BuildDate = ""
)

// Info is the resolved build identity, with build-info fallbacks applied.
type Info struct {
	Version   string `json:"version"`
	Commit    string `json:"commit,omitempty"`
	BuildDate string `json:"buildDate,omitempty"`
	GoVersion string `json:"goVersion"`
	Platform  string `json:"platform"`
}

var (
	once     sync.Once
	resolved Info
)

// Get returns the build identity of the running binary.
//
// An unstamped binary is not necessarily an unknown one: the Go toolchain
// records the module version and a VCS stamp in the binary regardless of
// ldflags. Reporting "dev" without consulting them throws away information the
// runtime already holds.
func Get() Info {
	once.Do(func() {
		resolved = Info{
			Version:   Version,
			Commit:    Commit,
			BuildDate: BuildDate,
			GoVersion: runtime.Version(),
			Platform:  runtime.GOOS + "/" + runtime.GOARCH,
		}

		bi, ok := debug.ReadBuildInfo()
		if !ok {
			return
		}

		if resolved.Version == "dev" || resolved.Version == "" {
			if v := bi.Main.Version; v != "" && v != "(devel)" {
				resolved.Version = v
			}
		}

		for _, s := range bi.Settings {
			switch s.Key {
			case "vcs.revision":
				if resolved.Commit == "" {
					resolved.Commit = shortSHA(s.Value)
				}
			case "vcs.time":
				if resolved.BuildDate == "" {
					resolved.BuildDate = s.Value
				}
			case "vcs.modified":
				if s.Value == "true" && !strings.HasSuffix(resolved.Commit, "-dirty") {
					resolved.Commit += "-dirty"
				}
			}
		}
	})

	return resolved
}

// String renders the build identity for a log line or an about box.
func (i Info) String() string {
	s := i.Version
	if i.Commit != "" {
		s += " (" + i.Commit + ")"
	}
	if i.BuildDate != "" {
		s += " built " + i.BuildDate
	}
	return s
}

// Long renders the multi-line form used by a version subcommand.
func (i Info) Long(name string) string {
	var b strings.Builder
	fmt.Fprintf(&b, "%s %s\n", name, i.Version)
	if i.Commit != "" {
		fmt.Fprintf(&b, "  commit:     %s\n", i.Commit)
	}
	if i.BuildDate != "" {
		fmt.Fprintf(&b, "  built:      %s\n", i.BuildDate)
	}
	fmt.Fprintf(&b, "  go:         %s\n", i.GoVersion)
	fmt.Fprintf(&b, "  platform:   %s\n", i.Platform)
	return b.String()
}

// LDFlags returns the linker flags that stamp this package.
//
// It exists so that the release script, the Dockerfile and the workflow can be
// checked against one definition rather than each carrying its own copy of an
// import path that is wrong in a way nothing detects until a released binary
// reports "dev".
func LDFlags(version, commit, buildDate string) string {
	const pkg = "checkmate-app/pkg/version"
	return fmt.Sprintf(
		"-s -w -X %[1]s.Version=%[2]s -X %[1]s.Commit=%[3]s -X %[1]s.BuildDate=%[4]s",
		pkg, version, commit, buildDate,
	)
}

func shortSHA(s string) string {
	if len(s) > 12 {
		return s[:12]
	}
	return s
}
