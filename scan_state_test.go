package main

import (
	"sync"
	"testing"
)

// The tests below cover the record that lets the project detail view show a
// scan it did not start. The view is destroyed on navigation, so every one of
// these behaviours is the difference between a returning user seeing live
// progress and seeing nothing at all.

func TestGetActiveScanReportsNothingWhenIdle(t *testing.T) {
	a := &App{}

	got, err := a.GetActiveScan("proj-1")
	if err != nil {
		t.Fatalf("GetActiveScan: unexpected error: %v", err)
	}
	if got != nil {
		t.Fatalf("expected no active scan, got %+v", got)
	}
}

func TestActiveScanIsVisibleBeforeAnyProgressArrives(t *testing.T) {
	// A scan that has started but not yet counted a file must still be
	// reported. Otherwise a user navigating in during the directory walk —
	// which on a large tree is where most of the wall clock goes — is told
	// nothing is happening.
	a := &App{}
	a.markScanStarted("proj-1")

	got, err := a.GetActiveScan("proj-1")
	if err != nil {
		t.Fatalf("GetActiveScan: unexpected error: %v", err)
	}
	if got == nil {
		t.Fatal("expected an active scan immediately after it started")
	}
	if got.ProjectID != "proj-1" {
		t.Errorf("ProjectID = %q, want %q", got.ProjectID, "proj-1")
	}
	if got.Position != 0 || got.Total != 0 {
		t.Errorf("expected zeroed counters before the first event, got %d/%d",
			got.Position, got.Total)
	}
}

func TestActiveScanReflectsLatestProgress(t *testing.T) {
	a := &App{}
	a.markScanStarted("proj-1")

	a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: 10, Total: 100, CurrentFile: "a.go"})
	a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: 50, Total: 200, CurrentFile: "b.go"})

	got, _ := a.GetActiveScan("proj-1")
	if got == nil {
		t.Fatal("expected an active scan")
	}
	if got.Position != 50 || got.Total != 200 || got.CurrentFile != "b.go" {
		t.Errorf("got %d/%d %q, want 50/200 \"b.go\"", got.Position, got.Total, got.CurrentFile)
	}
}

func TestScansAreTrackedPerProject(t *testing.T) {
	// "scan-progress" is one global channel. If the record did not key by
	// project, one project's view would render another project's numbers.
	a := &App{}
	a.markScanStarted("proj-1")
	a.markScanStarted("proj-2")

	a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: 5, Total: 10})
	a.recordScanProgress(ScanProgress{ProjectID: "proj-2", Position: 900, Total: 1000})

	one, _ := a.GetActiveScan("proj-1")
	two, _ := a.GetActiveScan("proj-2")

	if one == nil || one.Position != 5 {
		t.Errorf("proj-1 = %+v, want position 5", one)
	}
	if two == nil || two.Position != 900 {
		t.Errorf("proj-2 = %+v, want position 900", two)
	}
}

func TestFinishedScanIsNoLongerReported(t *testing.T) {
	a := &App{}
	a.markScanStarted("proj-1")
	a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: 10, Total: 10})
	a.markScanFinished("proj-1")

	got, _ := a.GetActiveScan("proj-1")
	if got != nil {
		t.Fatalf("expected no active scan after completion, got %+v", got)
	}
}

func TestFinishingOneScanLeavesOthersRunning(t *testing.T) {
	a := &App{}
	a.markScanStarted("proj-1")
	a.markScanStarted("proj-2")
	a.markScanFinished("proj-1")

	if got, _ := a.GetActiveScan("proj-1"); got != nil {
		t.Errorf("proj-1 should have finished, got %+v", got)
	}
	if got, _ := a.GetActiveScan("proj-2"); got == nil {
		t.Error("proj-2 should still be running")
	}
}

func TestLateProgressDoesNotResurrectAFinishedScan(t *testing.T) {
	// Progress is coalesced onto a ticker inside the engine, so an event can
	// be delivered fractionally after the scan returns. Recording it would
	// leave the project advertised as scanning for the rest of the session,
	// with a progress bar that never moves again.
	a := &App{}
	a.markScanStarted("proj-1")
	a.markScanFinished("proj-1")

	a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: 99, Total: 100})

	if got, _ := a.GetActiveScan("proj-1"); got != nil {
		t.Fatalf("a late event resurrected a finished scan: %+v", got)
	}
}

func TestReturnedProgressIsACopy(t *testing.T) {
	// The view holds whatever it is handed. If that were the live record, a
	// caller could mutate the scan state, and the marshaller could read a
	// struct being written by the progress goroutine.
	a := &App{}
	a.markScanStarted("proj-1")
	a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: 1, Total: 10})

	first, _ := a.GetActiveScan("proj-1")
	first.Position = 9999

	second, _ := a.GetActiveScan("proj-1")
	if second.Position != 1 {
		t.Errorf("mutating the returned value changed the record: position = %d, want 1",
			second.Position)
	}
}

func TestScanStateIsSafeUnderConcurrentAccess(t *testing.T) {
	// Progress is written from the scan goroutine while the view reads from
	// the Wails IPC goroutine. Run under -race.
	a := &App{}
	a.markScanStarted("proj-1")

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(2)
		go func(n int) {
			defer wg.Done()
			a.recordScanProgress(ScanProgress{ProjectID: "proj-1", Position: int64(n), Total: 50})
		}(i)
		go func() {
			defer wg.Done()
			_, _ = a.GetActiveScan("proj-1")
		}()
	}
	wg.Wait()

	if got, _ := a.GetActiveScan("proj-1"); got == nil {
		t.Fatal("scan should still be running")
	}
}

func TestMarkScanFinishedOnAnUnknownProjectIsHarmless(t *testing.T) {
	// StartScan defers markScanFinished, so this runs on paths where the scan
	// never started — a store failure, for instance.
	a := &App{}
	a.markScanFinished("never-started")

	if got, _ := a.GetActiveScan("never-started"); got != nil {
		t.Fatalf("expected nil, got %+v", got)
	}
}
