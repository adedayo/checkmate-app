import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailComponent } from './project-detail.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { vi, MockInstance } from 'vitest';

import * as WailsApp from '../../../wailsjs/go/main/App';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let getProjectsSpy: MockInstance;
  let getFindingsSpy: MockInstance;
  let startScanSpy: MockInstance;
  let getActiveScanSpy: MockInstance;

  beforeEach(async () => {
    getProjectsSpy = vi.fn().mockResolvedValue([
      { ID: '1', Name: 'Test Project 1', Workspace: 'W1', LastScan: '2023-01-01', Repositories: [{Location: "repo1"}] } as any
    ]);
    
    getFindingsSpy = vi.fn().mockResolvedValue([
      { Id: 'f1', Title: 'Secret Exposed', Location: { File: 'main.go', Line: 10 } } as any
    ]);

    startScanSpy = vi.fn().mockResolvedValue(undefined);

    // Defaults to "no scan running". Individual tests override it.
    getActiveScanSpy = vi.fn().mockResolvedValue(null);

    (window as any).go = {
      main: {
        App: {
          GetProjects: getProjectsSpy,
          GetProjectFindings: getFindingsSpy,
          StartScan: startScanSpy,
          GetActiveScan: getActiveScanSpy,
          GetExceptions: vi.fn().mockResolvedValue([]),
          GetAISettings: vi.fn().mockResolvedValue({ Provider: 'none', Enabled: false })
        }
      }
    };
    
    (window as any).runtime = {
      EventsOn: vi.fn(),
      EventsOff: vi.fn(),
      EventsOnMultiple: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), FormsModule, ProjectDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['id', '1']])) // mock the route param
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should load project details and findings on init', async () => {
    fixture.detectChanges();
    // In Angular testing with fake timers, flush microtasks for promises
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
      vi.advanceTimersByTime(200);
    }
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(getProjectsSpy).toHaveBeenCalled();
    expect(getFindingsSpy).toHaveBeenCalledWith('1', '');
    expect(component.project()?.Name).toBe('Test Project 1');
    expect(component.findings().length).toBe(1);
  });

  it('should run a scan when requested', async () => {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
      vi.advanceTimersByTime(200);
    }

    component.runScan();
    // Resolve the StartScan promise
    await Promise.resolve();
    vi.advanceTimersByTime(2000); // simulate the timeout wait

    expect(startScanSpy).toHaveBeenCalledWith('1');
    expect(component.scanning()).toBe(false);
    expect(component.activeTab()).toBe('vulnerabilities');
  });

  describe('scanProgressLabel', () => {
    // The engine reports Total as a running discovered count, so it climbs
    // while the walk is in flight. These cases are the ones that would
    // otherwise show a nonsense percentage.

    it('falls back to a generic label before any progress arrives', () => {
      component.scanProgress.set(null);
      expect(component.scanProgressLabel()).toBe('Scanning...');
    });

    it('shows a percentage once position and total are sane', () => {
      component.scanProgress.set({ position: 250, total: 1000, currentFile: 'a.go' });
      expect(component.scanProgressLabel()).toBe('Scanning... 25%');
    });

    it('never reports above 100% when position outruns a stale total', () => {
      // Position can exceed Total mid-walk, since Total is still being
      // discovered. Showing "Scanning... 400%" would be worse than a count.
      component.scanProgress.set({ position: 400, total: 100, currentFile: 'b.go' });
      expect(component.scanProgressLabel()).toBe('Scanning... 400 files');
    });

    it('shows a file count when the total is not yet known', () => {
      component.scanProgress.set({ position: 42, total: 0, currentFile: 'c.go' });
      expect(component.scanProgressLabel()).toBe('Scanning... 42 files');
    });

    it('does not show 0% at the very start of a scan', () => {
      component.scanProgress.set({ position: 0, total: 0, currentFile: 'starting scan ...' });
      expect(component.scanProgressLabel()).toBe('Scanning...');
    });
  });

  describe('detailed scan progress', () => {
    it('reports n of N once the total is trustworthy', () => {
      component.scanProgress.set({ position: 1234, total: 22591, currentFile: 'a.go' });
      expect(component.scanCountLabel()).toBe('1,234 of 22,591 files');
      expect(component.scanPercent()).toBe(5);
    });

    it('drops the denominator while the walk is still discovering files', () => {
      // Total is a moving denominator. "400 of 100 files" would be nonsense,
      // and the percentage would read above 100.
      component.scanProgress.set({ position: 400, total: 100, currentFile: 'b.go' });
      expect(component.scanCountLabel()).toBe('400 files scanned');
      expect(component.scanPercent()).toBeNull();
    });

    it('distinguishes "no percentage yet" from 0%', () => {
      // The template picks an indeterminate bar over a bar stuck at zero, and
      // it can only do that if these two cases are distinguishable.
      component.scanProgress.set({ position: 0, total: 0, currentFile: '' });
      expect(component.scanPercent()).toBeNull();

      component.scanProgress.set({ position: 1, total: 1000, currentFile: '' });
      expect(component.scanPercent()).toBe(0);
    });

    it('truncates long paths from the left, keeping the informative end', () => {
      const long = '/Users/someone/dev/' + 'nested/'.repeat(20) + 'target.go';
      component.scanProgress.set({ position: 1, total: 2, currentFile: long });

      const shown = component.scanCurrentFile();
      expect(shown.length).toBeLessThanOrEqual(80);
      expect(shown.startsWith('…')).toBe(true);
      expect(shown.endsWith('target.go')).toBe(true);
    });

    it('shows short paths untouched', () => {
      component.scanProgress.set({ position: 1, total: 2, currentFile: 'src/main.go' });
      expect(component.scanCurrentFile()).toBe('src/main.go');
    });

    it('shows nothing rather than "undefined" when no file is reported', () => {
      component.scanProgress.set({ position: 1, total: 2, currentFile: '' });
      expect(component.scanCurrentFile()).toBe('');
    });
  });

  describe('resuming a scan after navigating away and back', () => {
    // The component is destroyed on navigation, taking its listeners and its
    // progress signal with it. Everything here is the difference between a
    // returning user seeing a live scan and seeing an idle project.

    async function settle() {
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
        vi.advanceTimersByTime(200);
      }
    }

    it('adopts a scan that was already running when the view opened', async () => {
      getActiveScanSpy.mockResolvedValue({
        projectId: '1', position: 500, total: 2000, currentFile: 'deep/file.go'
      });

      fixture.detectChanges();
      await settle();

      expect(component.scanning()).toBe(true);
      expect(component.scanPercent()).toBe(25);
      expect(component.scanCountLabel()).toBe('500 of 2,000 files');
    });

    it('stays idle when no scan is running', async () => {
      getActiveScanSpy.mockResolvedValue(null);

      fixture.detectChanges();
      await settle();

      expect(component.scanning()).toBe(false);
      expect(component.scanProgress()).toBeNull();
    });

    it('does not block the view if the backend cannot answer', async () => {
      getActiveScanSpy.mockRejectedValue(new Error('store not initialised'));

      fixture.detectChanges();
      await settle();

      expect(component.scanning()).toBe(false);
    });

    it('clears an adopted scan once it finishes, without a StartScan promise', async () => {
      // This component never called StartScan, so nothing else will tell it
      // the scan has ended. Without the poller the spinner runs forever.
      getActiveScanSpy.mockResolvedValue({
        projectId: '1', position: 10, total: 20, currentFile: 'x.go'
      });

      fixture.detectChanges();
      await settle();
      expect(component.scanning()).toBe(true);

      getActiveScanSpy.mockResolvedValue(null);
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(1600);
        await Promise.resolve();
      }

      expect(component.scanning()).toBe(false);
      expect(component.scanProgress()).toBeNull();
    });
  });
});
