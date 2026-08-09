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

  beforeEach(async () => {
    getProjectsSpy = vi.fn().mockResolvedValue([
      { ID: '1', Name: 'Test Project 1', Workspace: 'W1', LastScan: '2023-01-01', Repositories: [{Location: "repo1"}] } as any
    ]);
    
    getFindingsSpy = vi.fn().mockResolvedValue([
      { Id: 'f1', Title: 'Secret Exposed', Location: { File: 'main.go', Line: 10 } } as any
    ]);

    startScanSpy = vi.fn().mockResolvedValue(undefined);

    (window as any).go = {
      main: {
        App: {
          GetProjects: getProjectsSpy,
          GetProjectFindings: getFindingsSpy,
          StartScan: startScanSpy,
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
});
