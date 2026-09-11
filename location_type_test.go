package main

import "testing"

// AddRepository stored repositories with an empty LocationType, which the scan
// engine's acquisition switch matched to neither "git" nor "filesystem" and so
// discarded. The scan then completed with zero findings and presented that as a
// clean result. This is the classification that stops it happening.
func TestLocationType(t *testing.T) {
	cases := []struct {
		location string
		want     string
	}{
		{"https://github.com/adedayo/static-analysis-test-code", "git"},
		{"http://internal.example/repo.git", "git"},
		{"git://github.com/adedayo/checkmate.git", "git"},
		{"ssh://git@github.com/adedayo/checkmate.git", "git"},
		{"git@github.com:adedayo/checkmate.git", "git"},
		{"/Users/someone/work/code/thing", "filesystem"},
		{"./relative/path", "filesystem"},
		{`C:\src\thing`, "filesystem"},
	}

	for _, tc := range cases {
		t.Run(tc.location, func(t *testing.T) {
			if got := locationType(tc.location); got != tc.want {
				t.Errorf("locationType(%q) = %q, want %q", tc.location, got, tc.want)
			}
		})
	}
}
