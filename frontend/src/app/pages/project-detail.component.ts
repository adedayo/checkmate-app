import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  GetProjects,
  AddRepository,
  RemoveRepository,
  StartScan,
  GetProjectFindings,
  SuppressFinding,
  GetExceptions,
  RemoveException,
  ExportExceptions,
  ImportExceptions,
  GetProjectScanHistory,
  DeleteProjectScans,
  SelectDirectory,
  UpdateProjectDetails,
  AITriageFinding,
  GetAISettings,
  MarkFindingTruePositive,
  GetActiveScan,
} from '../../../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../../../wailsjs/runtime/runtime';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { severityScheme } from '../shared/ui/chart-theme';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, FormsModule, CommonModule, NgxChartsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      @if (aiTriageProgress()) {
        <div
          class="fixed bottom-6 right-6 bg-card shadow-xl rounded-xl border border-info/20 p-4 z-50 flex items-center space-x-4 animate-in slide-in-from-bottom-5"
        >
          <div
            class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/10"
          >
            <svg
              class="h-5 w-5 text-info"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            @if (
              aiTriageProgress().completed + aiTriageProgress().failed < aiTriageProgress().total
            ) {
              <svg
                class="absolute inset-0 h-full w-full animate-spin text-info/30"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            }
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-foreground">AI Triage in Progress</h4>
            <p class="text-xs text-muted-foreground">
              Analyzing {{ aiTriageProgress().completed + aiTriageProgress().failed }} /
              {{ aiTriageProgress().total }} findings
            </p>
            @if (aiTriageProgress().autoSuppressed > 0) {
              <p class="text-[10px] font-medium text-success mt-0.5">
                {{ aiTriageProgress().autoSuppressed }} false positives auto-suppressed
              </p>
            }
          </div>
        </div>
      }

      <!-- Header -->
      <div class="flex items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <a
          routerLink="/projects"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-accent text-muted-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </a>
        <div class="flex-1">
          @if (isEditing()) {
            <div class="flex flex-col gap-3">
              <div>
                <label class="block text-xs font-semibold text-muted-foreground mb-1"
                  >Project Name</label
                >
                <input
                  type="text"
                  [(ngModel)]="editName"
                  class="w-full px-3 py-2 bg-muted border border-border rounded text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted-foreground mb-1"
                  >Workspace</label
                >
                <input
                  type="text"
                  list="workspaces"
                  [(ngModel)]="editWorkspace"
                  class="w-full px-3 py-2 bg-muted border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
                <datalist id="workspaces">
                  @for (ws of availableWorkspaces(); track ws) {
                    <option [value]="ws"></option>
                  }
                </datalist>
              </div>
              <div>
                <label class="block text-xs font-semibold text-muted-foreground mb-1"
                  >Description (Optional)</label
                >
                <input
                  type="text"
                  [(ngModel)]="editDescription"
                  class="w-full px-3 py-2 bg-muted border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div class="flex gap-2 mt-1">
                <button
                  (click)="saveDetails()"
                  class="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded shadow-sm transition-colors"
                >
                  Save
                </button>
                <button
                  (click)="cancelEdit()"
                  class="px-4 py-1.5 bg-muted hover:bg-accent text-foreground text-sm font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          } @else {
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold text-foreground">
                {{ project()?.Name || 'Loading...' }}
              </h2>
              <button
                (click)="startEdit()"
                class="text-muted-foreground hover:text-primary transition-colors"
                title="Edit Project Details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </div>
            <p class="text-muted-foreground mt-1 font-mono text-sm flex gap-4">
              <span>Workspace: {{ project()?.Workspace || 'N/A' }}</span>
              <span
                >Last Scan:
                @if (project()?.LastScan && !project()?.LastScan.startsWith('0001-01-01')) {
                  {{ project()?.LastScan | date: 'medium' }}
                } @else {
                  Never
                }
              </span>
            </p>
            @if (project()?.Description) {
              <p class="text-foreground mt-2 text-sm max-w-2xl">{{ project()?.Description }}</p>
            }
          }
        </div>
        <button
          (click)="runScan()"
          [disabled]="scanning()"
          class="px-6 py-2.5 bg-gradient-to-r from-success to-success hover:from-success/90 hover:to-success disabled:opacity-50 text-success-foreground rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          @if (scanning()) {
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-background"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ scanProgressLabel() }}
          } @else {
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Run Scan
          }
        </button>
      </div>

      <!-- Scan progress. A sibling of the header card rather than a child:
 the header is a flex row, and a file path placed in it would be
 squeezed against the button and resize it as paths of differing
 length arrive. -->
      @if (scanning() && scanProgress(); as _p) {
        <div class="mt-4 p-4 rounded-lg border border-border bg-muted/50">
          <div class="flex items-baseline justify-between gap-4">
            <span class="text-sm font-medium text-foreground">
              {{ scanCountLabel() }}
            </span>
            @if (scanPercent() !== null) {
              <span class="text-sm font-semibold text-success tabular-nums">
                {{ scanPercent() }}%
              </span>
            }
          </div>

          <div class="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            @if (scanPercent() !== null) {
              <div
                class="h-full rounded-full bg-gradient-to-r from-success to-success transition-all duration-300"
                [style.width.%]="scanPercent()"
              ></div>
            } @else {
              <!-- Total is still being discovered, so there is no honest
 fraction to draw. Indeterminate rather than a bar at zero. -->
              <div
                class="h-full w-1/3 rounded-full bg-gradient-to-r from-success to-success animate-pulse"
              ></div>
            }
          </div>

          @if (scanCurrentFile()) {
            <p
              class="mt-2 text-xs text-muted-foreground font-mono truncate"
              [title]="scanProgress()?.currentFile"
            >
              {{ scanCurrentFile() }}
            </p>
          }
        </div>
      }

      <!-- Trawl-style Tabs -->
      <div class="flex space-x-6 border-b border-border">
        <button
          (click)="activeTab.set('overview')"
          [class]="
            activeTab() === 'overview'
              ? 'border-primary text-primary font-semibold border-b-2'
              : 'border-transparent text-muted-foreground hover:text-foreground border-b-2'
          "
          class="py-3 px-1 text-xs uppercase tracking-wider transition"
        >
          Overview
        </button>
        <button
          (click)="activeTab.set('trends'); loadTrends()"
          [class]="
            activeTab() === 'trends'
              ? 'border-primary text-primary font-semibold border-b-2'
              : 'border-transparent text-muted-foreground hover:text-foreground border-b-2'
          "
          class="py-3 px-1 text-xs uppercase tracking-wider transition"
        >
          Trends
        </button>
        <button
          (click)="activeTab.set('vulnerabilities')"
          [class]="
            activeTab() === 'vulnerabilities'
              ? 'border-primary text-primary font-semibold border-b-2'
              : 'border-transparent text-muted-foreground hover:text-foreground border-b-2'
          "
          class="py-3 px-1 text-xs uppercase tracking-wider transition flex items-center space-x-1.5"
        >
          <span>Vulnerabilities</span>
          @if (activeFindings().length > 0) {
            <span
              class="px-1.5 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold"
              >{{ activeFindings().length }}</span
            >
          }
        </button>
        <button
          (click)="activeTab.set('exceptions'); loadExceptions()"
          [class]="
            activeTab() === 'exceptions'
              ? 'border-primary text-primary font-semibold border-b-2'
              : 'border-transparent text-muted-foreground hover:text-foreground border-b-2'
          "
          class="py-3 px-1 text-xs uppercase tracking-wider transition flex items-center space-x-1.5"
        >
          <span>Exceptions</span>
        </button>
      </div>

      <!-- Overview Tab -->
      @if (activeTab() === 'overview') {
        <div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 class="text-lg font-semibold text-foreground mb-4">Add Repository</h3>
          <div class="flex gap-4">
            <input
              type="text"
              [(ngModel)]="newRepoLocation"
              placeholder="Path to local repo or Git URL (e.g. https://github.com/org/repo.git)"
              class="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              (click)="browseDirectory()"
              class="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent font-medium transition-colors border border-border whitespace-nowrap"
            >
              Browse Local Filesystem...
            </button>
            <button
              (click)="addRepository()"
              class="px-6 py-2 bg-gradient-to-r from-primary to-info text-primary-foreground rounded-lg hover:from-primary/90 hover:to-info font-medium transition-colors shadow-sm"
            >
              Add
            </button>
          </div>
        </div>

        <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-muted border-b border-border">
              <tr>
                <th
                  class="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Repository Location
                </th>
                <th
                  class="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (repo of project()?.Repositories || []; track repo.Location) {
                <tr class="hover:bg-accent/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-foreground font-mono text-sm break-all">
                    {{ repo.Location }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      (click)="removeRepository(repo.Location)"
                      class="text-destructive hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10"
                      title="Remove Repository"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="2" class="px-6 py-8 text-center text-muted-foreground">
                    No repositories added yet.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Vulnerabilities Tab -->
      @if (activeTab() === 'vulnerabilities') {
        <div class="flex justify-between items-center mb-4">
          <div class="flex gap-2">
            @if (selectedHistoricalScanID() || selectedSeverityFilter()) {
              <div
                class="bg-info/10 border border-info/20 rounded-lg p-3 flex items-center justify-between shadow-sm flex-1"
              >
                <div class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-info"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span class="text-sm text-info">
                    Viewing filtered results
                    @if (selectedHistoricalScanID()) {
                      for historical scan
                    }
                    @if (selectedSeverityFilter()) {
                      (Severity: <strong>{{ selectedSeverityFilter() }}</strong
                      >)
                    }
                  </span>
                </div>
                <button
                  (click)="
                    selectedHistoricalScanID.set('');
                    selectedSeverityFilter.set('');
                    fetchFindings(project().ID)
                  "
                  class="text-xs font-semibold text-info hover:text-info transition-colors bg-card px-3 py-1.5 rounded border border-info/20 ml-4"
                >
                  Clear Filter
                </button>
              </div>
            }
          </div>

          <div
            class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-muted-foreground"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <select
              [ngModel]="selectedSeverityFilter()"
              (ngModelChange)="selectedSeverityFilter.set($event)"
              class="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-foreground font-medium cursor-pointer appearance-none pr-4"
            >
              <option value="">All Criticalities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Info">Info</option>
            </select>
          </div>
        </div>

        <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-muted border-b border-border">
              <tr>
                <th
                  class="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  class="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  class="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Criticality
                </th>
                <th
                  class="px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (finding of activeFindings(); track $index) {
                <tr
                  class="hover:bg-accent/50 transition-colors cursor-pointer"
                  (click)="selectFinding(finding)"
                >
                  <td class="px-6 py-4 text-sm text-foreground">
                    <div
                      class="font-mono text-primary font-semibold"
                      [class.line-through]="finding.Excluded"
                    >
                      {{ finding.location || finding.Location || 'Unknown File' }}
                    </div>
                    @if (
                      finding.range?.start?.line !== undefined ||
                      finding.Range?.Start?.Line !== undefined
                    ) {
                      <div class="text-xs text-muted-foreground font-mono mt-0.5">
                        Line:
                        {{ (finding.range?.start?.line ?? finding.Range?.Start?.Line ?? 0) + 1 }}
                      </div>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-semibold text-foreground">
                      {{
                        finding.justification?.headline?.description ||
                          finding.Justification?.Headline?.Description ||
                          finding.providerID ||
                          finding.ProviderID ||
                          'Potential Secret / Vulnerability'
                      }}
                    </div>
                    @if (finding.source || finding.Source) {
                      <div
                        class="text-xs font-mono text-muted-foreground mt-1 bg-muted p-2 rounded border border-border overflow-x-auto max-w-xl"
                      >
                        {{ finding.source || finding.Source }}
                      </div>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                      [ngClass]="{
                        'bg-severity-critical/10 text-severity-critical border-severity-critical/20':
                          (finding.severity || finding.Severity)?.toLowerCase() === 'critical',
                        'bg-severity-high/10 text-severity-high border-severity-high/20':
                          (finding.severity || finding.Severity)?.toLowerCase() === 'high',
                        'bg-severity-medium/10 text-severity-medium border-severity-medium/20':
                          (finding.severity || finding.Severity)?.toLowerCase() === 'medium',
                        'bg-severity-low/10 text-severity-low border-severity-low/20':
                          (finding.severity || finding.Severity)?.toLowerCase() === 'low',
                        'bg-muted text-foreground border-border':
                          !(finding.severity || finding.Severity) ||
                          (finding.severity || finding.Severity)?.toLowerCase() === 'info',
                      }"
                    >
                      {{ finding.severity || finding.Severity || 'Info' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border"
                    >
                      {{
                        finding.justification?.headline?.confidence ||
                          finding.Justification?.Headline?.Confidence ||
                          'High'
                      }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="px-6 py-8 text-center text-muted-foreground">
                    @if ((project()?.Repositories || []).length === 0) {
                      No repositories added to this project yet. Add a local directory path or Git
                      URL above and click <strong>Add</strong>, then run a scan!
                    } @else {
                      No vulnerabilities found in the latest scan!
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Trends Tab -->
      @if (activeTab() === 'trends') {
        <div class="space-y-6">
          <div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-foreground">Vulnerability Trends Over Time</h3>
              <button
                (click)="clearHistory()"
                class="px-4 py-2 border border-destructive/20 text-destructive rounded-lg hover:bg-destructive/10 font-medium transition-colors text-sm"
              >
                Clear History
              </button>
            </div>
            <div class="h-80 w-full overflow-hidden flex items-center justify-center">
              @if (scanHistory().length > 1) {
                <ngx-charts-line-chart
                  [scheme]="'cool'"
                  [results]="trendChartData()"
                  [gradient]="false"
                  [xAxis]="true"
                  [yAxis]="true"
                  [legend]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  xAxisLabel="Scans (Timeline)"
                  yAxisLabel="Findings Count"
                  [autoScale]="true"
                  [showGridLines]="false"
                  (select)="onChartSelect($event)"
                  (legendLabelClick)="onLegendClick($event)"
                >
                </ngx-charts-line-chart>
              } @else if (scanHistory().length === 1) {
                <div class="text-muted-foreground text-center flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="mb-4 opacity-50"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <p>Run another scan to see trends over time.</p>
                </div>
              } @else {
                <div class="text-muted-foreground text-center flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="mb-4 opacity-50"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <p>No historical scans found. Run a scan to see data!</p>
                </div>
              }
            </div>
            @if (scanHistory().length > 1) {
              <p class="text-xs text-muted-foreground mt-4">
                Click any data point to view findings from that historical scan.
              </p>
            }
          </div>

          <div class="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 class="text-lg font-semibold text-foreground mb-4">Latest Scan Breakdown</h3>
            <div class="h-64 w-full overflow-hidden flex items-center justify-center">
              @if (scanHistory().length > 0) {
                <ngx-charts-bar-vertical
                  [scheme]="'cool'"
                  [results]="barChartData()"
                  [gradient]="false"
                  [xAxis]="true"
                  [yAxis]="true"
                  [legend]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  [showGridLines]="false"
                  [customColors]="barChartColors"
                  xAxisLabel="Severity"
                  yAxisLabel="Count"
                  (select)="onBarChartSelect($event)"
                >
                </ngx-charts-bar-vertical>
              } @else {
                <div class="text-muted-foreground text-center">
                  <p>No data available for breakdown.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Exceptions Tab -->
      @if (activeTab() === 'exceptions') {
        <div
          class="bg-card p-6 rounded-2xl border border-border shadow-sm mb-6 flex justify-between items-center"
        >
          <div>
            <h3 class="text-lg font-semibold text-foreground">Scan Exceptions</h3>
            <p class="text-muted-foreground text-sm">
              Manage rules that filter out false positives natively during scans.
            </p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="importExceptions()"
              class="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent font-medium transition-colors text-sm"
            >
              Import YAML
            </button>
            <button
              (click)="exportExceptions()"
              class="px-4 py-2 bg-foreground hover:bg-foreground/90 text-background rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              Export YAML
            </button>
          </div>
        </div>

        <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <table class="w-full text-left table-fixed">
            <thead class="bg-muted border-b border-border">
              <tr>
                <th
                  class="w-24 px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  class="w-1/4 px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  File / Location
                </th>
                <th
                  class="w-1/4 px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Rule Match
                </th>
                <th
                  class="w-auto px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Reason
                </th>
                <th
                  class="w-28 px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (exc of exceptions(); track exc.id || exc.ID) {
                <tr
                  (click)="selectedException.set(exc)"
                  class="hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <td class="px-6 py-4">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-semibold bg-info/10 text-info border border-info/20"
                    >
                      {{ exc.scope?.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-mono text-primary break-all">
                    {{ exc.scope?.path || 'Global (All Files)' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-foreground font-mono break-all">
                    {{
                      exc.scope?.secretChecksum ||
                        exc.scope?.stringMatch ||
                        exc.scope?.regexMatch ||
                        exc.scope?.path ||
                        'N/A'
                    }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-muted-foreground break-words whitespace-pre-wrap max-w-md"
                  >
                    {{ getExceptionReasonText(exc.reason) }}
                  </td>
                  <td
                    class="px-6 py-4 text-right flex items-center justify-end gap-1"
                    (click)="$event.stopPropagation()"
                  >
                    <button
                      (click)="selectedException.set(exc)"
                      class="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-accent"
                      title="View Exception Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      (click)="removeException(exc.id || exc.ID)"
                      class="text-destructive hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10"
                      title="Remove Exception"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-muted-foreground">
                    No exceptions found for this project.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Drawer -->
      @if (selectedFinding()) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <div
            class="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            (click)="selectedFinding.set(null)"
          ></div>
          <div
            class="relative w-full max-w-2xl h-full bg-card shadow-2xl flex flex-col border-l border-border"
            style="animation: slideIn 0.2s ease-out forwards;"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 class="text-lg font-semibold text-foreground">Finding Details</h3>
              <button
                (click)="selectedFinding.set(null)"
                class="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                >
                  Location
                </div>
                <div class="font-mono text-sm text-primary break-all">
                  {{ selectedFinding().location || selectedFinding().Location || 'Unknown' }}
                </div>
                @if (
                  selectedFinding().range?.start?.line !== undefined ||
                  selectedFinding().Range?.Start?.Line !== undefined
                ) {
                  <div class="text-sm text-foreground mt-1">
                    Line:
                    {{
                      (selectedFinding().range?.start?.line ??
                        selectedFinding().Range?.Start?.Line ??
                        0) + 1
                    }}
                  </div>
                }
              </div>

              <div>
                <div
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                >
                  Classification
                </div>
                <div class="flex items-center gap-3">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20"
                  >
                    {{
                      selectedFinding().justification?.headline?.confidence ||
                        selectedFinding().Justification?.Headline?.Confidence ||
                        'High'
                    }}
                    Confidence
                  </span>
                  <span class="text-foreground font-medium">
                    {{
                      selectedFinding().justification?.headline?.description ||
                        selectedFinding().Justification?.Headline?.Description ||
                        selectedFinding().providerID ||
                        selectedFinding().ProviderID ||
                        'Potential Secret / Vulnerability'
                    }}
                  </span>
                </div>
              </div>

              @if (selectedFinding().source || selectedFinding().Source) {
                <div>
                  <div
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Code Context
                  </div>
                  <pre
                    class="bg-muted p-4 rounded-xl border border-border overflow-x-auto text-sm font-mono text-foreground whitespace-pre-wrap"
                    >{{ selectedFinding().source || selectedFinding().Source }}</pre>
                </div>
              }

              @if (reusedSecrets().length > 0) {
                <div>
                  <div
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Reused In Other Files
                  </div>
                  <div class="space-y-2">
                    @for (reused of reusedSecrets(); track $index) {
                      <div
                        class="flex items-start gap-2 bg-muted/50 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors"
                        (click)="selectFinding(reused)"
                      >
                        <svg
                          class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          ></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <div class="flex-1">
                          <div class="text-sm font-mono text-primary break-all">
                            {{ reused.location || reused.Location || 'Unknown' }}
                          </div>
                          @if (
                            reused.range?.start?.line !== undefined ||
                            reused.Range?.Start?.Line !== undefined
                          ) {
                            <div class="text-xs text-muted-foreground mt-0.5">
                              Line:
                              {{
                                (reused.range?.start?.line ?? reused.Range?.Start?.Line ?? 0) + 1
                              }}
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (selectedFinding().Excluded) {
                <div
                  class="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3"
                >
                  <svg
                    class="w-5 h-5 text-success mt-0.5 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                    />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <div>
                    <div class="font-semibold text-success">Suppressed as False Positive</div>
                    <div class="text-sm text-success mt-1">This finding is ignored in reports.</div>
                  </div>
                </div>
              } @else {
                <div class="pt-4 border-t border-border">
                  <div class="flex items-center justify-between mb-3">
                    <div
                      class="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      AI Triage
                    </div>
                    @if (aiEnabled()) {
                      <button
                        (click)="runAITriage()"
                        [disabled]="triaging()"
                        class="px-3 py-1.5 bg-info/10 hover:bg-info/90/10 text-info text-xs font-medium rounded border border-info/20 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        @if (triaging()) {
                          <svg
                            class="animate-spin h-3.5 w-3.5 text-info"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              class="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            ></circle>
                            <path
                              class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Analyzing...</span>
                        } @else {
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          <span>Ask AI</span>
                        }
                      </button>
                    }
                  </div>

                  @if (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation) {
                    <div class="bg-info/10 border border-info/20 rounded-xl p-4 space-y-3">
                      <div class="flex items-start justify-between">
                        <div class="font-medium text-foreground text-sm">
                          {{
                            (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                              .summary ||
                              (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                                .Summary
                          }}
                        </div>
                        <div
                          class="px-2 py-0.5 rounded text-xs font-semibold bg-card border border-info/20 text-info shadow-sm shrink-0 ml-3"
                        >
                          FP Likelihood:
                          {{
                            ((selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                              .fpLikelihood ||
                              (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                                .FPLikelihood) * 100 | number: '1.0-0'
                          }}%
                        </div>
                      </div>

                      @if (
                        (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                          .remediationHint ||
                        (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                          .RemediationHint
                      ) {
                        <div>
                          <div class="text-xs font-semibold text-muted-foreground mb-1">
                            Remediation
                          </div>
                          <div class="text-sm text-foreground">
                            {{
                              (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                                .remediationHint ||
                                (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                                  .RemediationHint
                            }}
                          </div>
                        </div>
                      }

                      @if (
                        (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                          .contextClues?.length > 0 ||
                        (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                          .ContextClues?.length > 0
                      ) {
                        <div>
                          <div class="text-xs font-semibold text-muted-foreground mb-1">
                            Reasoning
                          </div>
                          <ul class="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                            @for (
                              clue of (
                                selectedFinding().aiAnnotation || selectedFinding().AIAnnotation
                              ).contextClues ||
                                (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                                  .ContextClues;
                              track $index
                            ) {
                              <li>{{ clue }}</li>
                            }
                          </ul>
                        </div>
                      }
                      <div class="text-[10px] text-muted-foreground text-right">
                        Analyzed by
                        {{
                          (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation)
                            .model ||
                            (selectedFinding().aiAnnotation || selectedFinding().AIAnnotation).Model
                        }}
                      </div>
                    </div>
                  } @else if (!aiEnabled()) {
                    <div
                      class="text-sm text-muted-foreground bg-muted/50 p-3 rounded border border-border"
                    >
                      AI Triage is disabled.
                      <a
                        routerLink="/settings"
                        class="text-primary hover:underline"
                        (click)="selectedFinding.set(null)"
                        >Configure AI Settings</a
                      >
                      to enable automated analysis.
                    </div>
                  } @else {
                    <div class="text-sm text-muted-foreground">
                      Click 'Ask AI' to analyze this finding.
                    </div>
                  }
                </div>

                <div class="pt-4 border-t border-border mt-4">
                  <div
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3"
                  >
                    Manage Exception
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-muted-foreground mb-1">Scope Type</label>
                      <select
                        [(ngModel)]="suppressScope"
                        (change)="onScopeChange()"
                        class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="globalHash">
                          Global Hash (Ignore Exact Secret Everywhere)
                        </option>
                        <option value="globalString">
                          Global String (Ignore Exact Text Everywhere)
                        </option>
                        <option value="globalRegex">
                          Global Regex (Ignore Text Matching Regex Everywhere)
                        </option>
                        <option value="pathRegex">
                          Path Regex (Ignore all secrets in files matching regex)
                        </option>
                        <option value="pathString">
                          Path + String (Ignore exact text in this specific file)
                        </option>
                        <option value="pathHash">
                          Path + Hash (Ignore exact secret in this specific file)
                        </option>
                        <option value="pathRegexRegex">
                          Path + Regex (Ignore text matching regex in this specific file)
                        </option>
                      </select>
                    </div>

                    @if (suppressScope().startsWith('path') && suppressScope() !== 'pathRegex') {
                      <div>
                        <label class="block text-xs text-muted-foreground mb-1">File Path</label>
                        <input
                          type="text"
                          [(ngModel)]="suppressPath"
                          class="w-full px-3 py-2 font-mono text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    }

                    <div>
                      <label class="block text-xs text-muted-foreground mb-1"
                        >Match Pattern / String / Hash</label
                      >
                      <textarea
                        [(ngModel)]="suppressMatch"
                        rows="2"
                        class="w-full px-3 py-2 font-mono text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      ></textarea>
                    </div>

                    <div>
                      <label class="block text-xs text-muted-foreground mb-1"
                        >Reason for suppression</label
                      >
                      <input
                        type="text"
                        [(ngModel)]="suppressReason"
                        placeholder="e.g., Test credential, False positive"
                        class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div class="flex justify-between items-center pt-2">
                      <button
                        (click)="markTruePositive(selectedFinding().id || selectedFinding().ID)"
                        class="px-4 py-2 bg-success hover:bg-success/90 text-success-foreground rounded-lg font-medium transition-colors text-sm shadow-sm flex items-center gap-1.5"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Mark as True Positive
                      </button>
                      <button
                        (click)="suppressSelected()"
                        [disabled]="suppressing() || !suppressReason() || !suppressMatch()"
                        class="px-6 py-2 bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                      >
                        {{ suppressing() ? 'Suppressing...' : 'Mark as False Positive' }}
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Exception Details Slideout Drawer -->
      @if (selectedException()) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <div
            class="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            (click)="selectedException.set(null)"
          ></div>
          <div
            class="relative w-full max-w-2xl h-full bg-card shadow-2xl flex flex-col border-l border-border"
            style="animation: slideIn 0.2s ease-out forwards;"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 class="text-lg font-semibold text-foreground">Exception Details</h3>
                <div class="text-xs text-muted-foreground font-mono mt-0.5">
                  {{ selectedException().id || selectedException().ID }}
                </div>
              </div>
              <button
                (click)="selectedException.set(null)"
                class="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                >
                  Scope & Location
                </div>
                <div class="flex items-center gap-3 mb-2">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-semibold bg-info/10 text-info border border-info/20"
                  >
                    {{ selectedException().scope?.type }}
                  </span>
                  <span class="text-foreground font-medium text-sm">
                    Rule ID: {{ selectedException().ruleId || selectedException().RuleID || 'N/A' }}
                  </span>
                </div>
                <div
                  class="font-mono text-sm text-primary break-all bg-muted p-3 rounded-xl border border-border"
                >
                  Path: {{ selectedException().scope?.path || 'Global (Applies to all files)' }}
                </div>
              </div>

              <div>
                <div
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                >
                  Pattern / Checksum Match
                </div>
                <div
                  class="bg-muted p-4 rounded-xl border border-border font-mono text-xs text-foreground break-all"
                >
                  {{
                    selectedException().scope?.secretChecksum ||
                      selectedException().scope?.stringMatch ||
                      selectedException().scope?.regexMatch ||
                      'N/A'
                  }}
                </div>
              </div>

              <div>
                <div
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                >
                  Reason & Description
                </div>
                <div
                  class="text-sm text-foreground bg-muted/50 p-4 rounded-xl border border-border whitespace-pre-wrap"
                >
                  {{ getExceptionReasonText(selectedException().reason) }}
                </div>
              </div>

              @if (getExceptionSnippetText(selectedException().reason)) {
                <div>
                  <div
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Code Snippet Context
                  </div>
                  <pre
                    class="bg-muted p-4 rounded-xl border border-border overflow-x-auto text-xs font-mono text-foreground whitespace-pre-wrap"
                    >{{ getExceptionSnippetText(selectedException().reason) }}</pre>
                </div>
              }

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div
                    class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1"
                  >
                    Created By
                  </div>
                  <div class="text-foreground font-medium">
                    {{ selectedException().createdBy || selectedException().CreatedBy || 'system' }}
                  </div>
                </div>
                <div>
                  <div
                    class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1"
                  >
                    Created At
                  </div>
                  <div class="text-foreground font-medium">
                    {{
                      selectedException().createdAt || selectedException().CreatedAt
                        | date: 'medium'
                    }}
                  </div>
                </div>
              </div>

              @if (selectedException().auditTrail && selectedException().auditTrail.length > 0) {
                <div>
                  <div
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Audit History
                  </div>
                  <div class="space-y-2">
                    @for (audit of selectedException().auditTrail; track audit.action) {
                      <div
                        class="text-xs p-3 rounded-lg bg-muted border border-border flex justify-between"
                      >
                        <div>
                          <span class="font-semibold text-foreground">{{ audit.action }}</span>
                          <span class="text-muted-foreground ml-2">{{ audit.details }}</span>
                        </div>
                        <span class="text-muted-foreground font-mono">{{
                          audit.timestamp | date: 'shortTime'
                        }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="p-6 border-t border-border flex justify-between items-center bg-muted">
              <button
                (click)="
                  removeException(selectedException().id || selectedException().ID);
                  selectedException.set(null)
                "
                class="px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-medium transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Delete Exception
              </button>
              <button
                (click)="selectedException.set(null)"
                class="px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-accent font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project = signal<any>(null);
  findings = signal<any[]>([]);
  newRepoLocation = '';
  scanning = signal(false);
  scanProgress = signal<{ position: number; total: number; currentFile: string } | null>(null);

  // The engine reports Total as the running discovered count while the walk is
  // still in flight, so it climbs during a scan and the percentage would jump
  // around early on. Show a bare file count until the two are close enough for
  // a percentage to be honest, and never render a figure above 100%.
  scanProgressLabel = computed(() => {
    const p = this.scanProgress();
    if (!p || p.position <= 0) return 'Scanning...';

    const pct = this.scanPercent();
    if (pct !== null) return `Scanning... ${pct}%`;
    return `Scanning... ${p.position.toLocaleString()} files`;
  });

  // Null while the denominator is still moving, so callers can distinguish
  // "no meaningful percentage yet" from "0%".
  scanPercent = computed<number | null>(() => {
    const p = this.scanProgress();
    if (!p || p.position <= 0 || p.total <= 0 || p.position > p.total) return null;
    return Math.min(100, Math.floor((p.position / p.total) * 100));
  });

  // "1,234 of 22,591 files" once the total is trustworthy, otherwise just the
  // count discovered so far — an N that is still climbing reads as though the
  // scan is shrinking when it overtakes an earlier estimate.
  scanCountLabel = computed(() => {
    const p = this.scanProgress();
    if (!p || p.position <= 0) return '';
    const pos = p.position.toLocaleString();
    if (p.total > 0 && p.position <= p.total) {
      return `${pos} of ${p.total.toLocaleString()} files`;
    }
    return `${pos} files scanned`;
  });

  // Paths in a deep tree are long enough to break the layout, and the
  // informative end is the right-hand one.
  scanCurrentFile = computed(() => {
    const f = this.scanProgress()?.currentFile ?? '';
    if (!f) return '';
    return f.length > 80 ? '…' + f.slice(-79) : f;
  });

  activeTab = signal<'overview' | 'vulnerabilities' | 'exceptions' | 'trends'>('overview');

  exceptions = signal<any[]>([]);
  selectedException = signal<any | null>(null);

  async markTruePositive(findingID: string) {
    const proj = this.project();
    if (!proj || !findingID) return;
    try {
      await MarkFindingTruePositive(proj.ID || proj.id, findingID);
      this.selectedFinding.set(null);
      this.selectedException.set(null);
      await this.loadExceptions();
      this.fetchFindings(proj.ID || proj.id);
    } catch (e) {
      alert('Error marking finding as true positive: ' + e);
    }
  }

  getExceptionReasonText(reason: string | undefined): string {
    if (!reason) return '';
    const parts = reason.split(/\nSnippet:\s*/);
    return parts[0].trim();
  }

  getExceptionSnippetText(reason: string | undefined): string | null {
    if (!reason) return null;
    const parts = reason.split(/\nSnippet:\s*/);
    if (parts.length > 1 && parts[1].trim()) {
      return parts[1].trim();
    }
    return null;
  }

  // Edit State
  isEditing = signal<boolean>(false);
  editName = '';
  editWorkspace = '';
  editDescription = '';
  availableWorkspaces = signal<string[]>([]);

  // Trends state
  scanHistory = signal<any[]>([]);
  trendChartData = signal<any[]>([]);
  barChartData = signal<any[]>([]);
  selectedHistoricalScanID = signal<string>('');
  selectedSeverityFilter = signal<string>('');

  barChartColors = severityScheme();

  selectedFinding = signal<any>(null);
  suppressReason = signal<string>('');
  suppressScope = signal<string>('globalHash');
  suppressMatch = signal<string>('');
  suppressPath = signal<string>('');
  suppressing = signal(false);

  aiEnabled = signal<boolean>(false);
  triaging = signal<boolean>(false);
  aiTriageProgress = signal<any>(null);
  private fetchFindingsTimeout: any;

  activeFindings = computed(() => {
    let list = this.findings().filter((f) => !f.Excluded && !f.excluded);
    const severity = this.selectedSeverityFilter();
    if (severity) {
      list = list.filter((f) => {
        const sev =
          f.severity ||
          f.Severity ||
          f.justification?.headline?.confidence ||
          f.Justification?.Headline?.Confidence ||
          '';
        return sev.toLowerCase() === severity.toLowerCase();
      });
    }
    return list;
  });

  reusedSecrets = computed(() => {
    const selected = this.selectedFinding();
    if (!selected) return [];
    const selectedHash = selected.sha256 || selected.SHA256;
    if (!selectedHash) return [];
    return this.findings().filter((f) => {
      const fHash = f.sha256 || f.SHA256;
      return fHash === selectedHash && f !== selected;
    });
  });

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    EventsOn('scan-finding', (finding: any) => {
      this.findings.update((f) => [...f, finding]);
    });

    EventsOn('scan-progress', (progress: any) => {
      // "scan-progress" is a single global channel. Without this guard, a scan
      // running on another project would drive this project's progress bar.
      // Events predating the projectId field are accepted rather than dropped.
      const pid = this.currentProjectId();
      if (progress?.projectId && pid && progress.projectId !== pid) return;

      this.scanProgress.set(progress);
      // A scan may have been started elsewhere — from another view, or before
      // this component existed. Progress arriving is proof it is running.
      if (!this.scanning()) this.scanning.set(true);
    });

    EventsOn('ai-triage-progress', (progress: any) => {
      this.aiTriageProgress.set(progress);
      if (progress.completed + progress.failed >= progress.total) {
        setTimeout(() => this.aiTriageProgress.set(null), 3000);
      }
    });

    EventsOn('scan-finding-updated', () => {
      if (this.fetchFindingsTimeout) clearTimeout(this.fetchFindingsTimeout);
      this.fetchFindingsTimeout = setTimeout(() => {
        if (this.project()) {
          const pid = this.project().id || this.project().ID;
          GetProjectFindings(pid, '').then((data: any) => {
            this.findings.set(data || []);
            const sel = this.selectedFinding();
            if (sel) {
              const updated = data.find((f: any) => (f.id || f.ID) === (sel.id || sel.ID));
              if (updated) this.selectedFinding.set(updated);
            }
          });
        }
      }, 1000);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchProject(id);
        // A scan started before this component existed is still running in the
        // backend, but the events it emitted while we were elsewhere are gone.
        // Ask for the current state rather than waiting for the next event, so
        // the bar appears immediately instead of up to a tick later — and so a
        // scan still walking the directory tree, which emits nothing for a
        // while on a large repository, is visible at all.
        this.resumeActiveScan(id);
      }
    });
    this.checkAISettings();
  }

  // The id from the route, which is available before the project has loaded.
  private routeProjectId: string | null = null;

  private currentProjectId(): string | null {
    const proj = this.project();
    return proj?.id || proj?.ID || this.routeProjectId;
  }

  private async resumeActiveScan(projectID: string) {
    this.routeProjectId = projectID;
    try {
      const active = await GetActiveScan(projectID);
      if (!active) return;

      this.scanning.set(true);
      this.scanProgress.set(active);
      this.activeTab.set('vulnerabilities');
      // This component did not call StartScan, so no promise will tell it when
      // the scan ends. Watch for completion instead.
      this.watchAdoptedScan(projectID);
    } catch {
      // A backend that cannot answer is not a reason to block the view.
    }
  }

  // Completion detector for a scan this component did not start.
  //
  // runScan() clears `scanning` when its StartScan promise resolves. A scan
  // adopted on navigation has no such promise here, so without this the
  // spinner would run until the view was destroyed again.
  private adoptedScanPoll: any = null;

  private watchAdoptedScan(projectID: string) {
    if (this.adoptedScanPoll) return;
    this.adoptedScanPoll = setInterval(async () => {
      try {
        const active = await GetActiveScan(projectID);
        if (active) return;

        this.stopWatchingAdoptedScan();
        this.scanning.set(false);
        this.scanProgress.set(null);
        this.fetchProject(projectID);
      } catch {
        this.stopWatchingAdoptedScan();
        this.scanning.set(false);
      }
    }, 1500);
  }

  private stopWatchingAdoptedScan() {
    if (this.adoptedScanPoll) {
      clearInterval(this.adoptedScanPoll);
      this.adoptedScanPoll = null;
    }
  }

  ngOnDestroy() {
    // These listeners are registered on the Wails runtime, which outlives the
    // component. Without this, navigating away and back stacks a second set of
    // handlers and every finding gets appended twice.
    EventsOff('scan-finding');
    EventsOff('scan-progress');
    EventsOff('ai-triage-progress');
    EventsOff('scan-finding-updated');

    if (this.fetchFindingsTimeout) clearTimeout(this.fetchFindingsTimeout);
    // Same reasoning as the listeners: the interval outlives the component and
    // would keep calling into a destroyed view, once per navigation.
    this.stopWatchingAdoptedScan();
  }

  async checkAISettings() {
    try {
      const s = await GetAISettings();
      this.aiEnabled.set(s?.enabled === true);
    } catch (e) {
      console.error('Failed to fetch AI Settings', e);
    }
  }

  async runAITriage() {
    const finding = this.selectedFinding();
    if (!finding) return;

    this.triaging.set(true);
    try {
      const ann = await AITriageFinding(finding.id || finding.ID);
      this.selectedFinding.update((f: any) => {
        if (!f) return f;
        return { ...f, AIAnnotation: ann, aiAnnotation: ann };
      });

      const allFindings = this.findings();
      const updated = allFindings.map((f: any) => {
        if ((f.id || f.ID) === (finding.id || finding.ID)) {
          return { ...f, AIAnnotation: ann, aiAnnotation: ann };
        }
        return f;
      });
      this.findings.set(updated);
    } catch (e) {
      console.error('Failed to run AI triage', e);
      alert('AI Triage failed: ' + e);
    } finally {
      this.triaging.set(false);
    }
  }

  fetchProject(id: string, retries = 3) {
    try {
      GetProjects().then((data: any) => {
        const proj = data.find((p: any) => p.ID === id);
        if (proj) {
          this.project.set(proj);
          this.fetchFindings(id);
          this.loadExceptions();
        }
      });
    } catch (e) {
      if (retries > 0) {
        setTimeout(() => this.fetchProject(id, retries - 1), 200);
      } else {
        console.warn('Wails IPC not available. Are you viewing in a standard browser?');
      }
    }
  }

  fetchFindings(projID: string, scanID: string = '') {
    GetProjectFindings(projID, scanID).then((findings) => {
      this.findings.set(findings || []);
    });
  }

  loadTrends() {
    const proj = this.project();
    if (!proj) return;

    GetProjectScanHistory(proj.ID, 30).then((history: any) => {
      if (!history) {
        history = [];
      }
      this.scanHistory.set(history);

      if (history.length === 0) {
        this.trendChartData.set([]);
        this.barChartData.set([]);
        return;
      }

      // Build line chart data: Reverse so oldest is first
      const revHistory = [...history].reverse();

      const totalSeries = { name: 'Total Issues', series: [] as any[] };
      const critSeries = { name: 'Critical', series: [] as any[] };
      const highSeries = { name: 'High', series: [] as any[] };

      const seenNames = new Map<string, number>();
      revHistory.forEach((scan: any, index: number) => {
        const d = new Date(scan.StartedAt || scan.Metrics?.StartedAt);
        let name: string;
        if (isNaN(d.getTime())) {
          name = 'Scan ' + (index + 1);
        } else {
          name =
            d.toLocaleDateString() +
            ' ' +
            d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // Ensure unique names for ngx-charts (it merges data points with identical names)
        const count = seenNames.get(name) || 0;
        seenNames.set(name, count + 1);
        if (count > 0) {
          name = name + ' #' + (count + 1);
        }
        totalSeries.series.push({
          name,
          value: scan.Metrics?.totalFindings || 0,
          extra: { scanID: scan.ID },
        });

        let crit = 0;
        let high = 0;
        if (scan.Metrics?.findingsBySeverity) {
          crit =
            scan.Metrics.findingsBySeverity['Critical'] ||
            scan.Metrics.findingsBySeverity['CRITICAL'] ||
            0;
          high =
            scan.Metrics.findingsBySeverity['High'] || scan.Metrics.findingsBySeverity['HIGH'] || 0;
        }
        critSeries.series.push({ name, value: crit, extra: { scanID: scan.ID } });
        highSeries.series.push({ name, value: high, extra: { scanID: scan.ID } });
      });

      this.trendChartData.set([totalSeries, critSeries, highSeries]);

      // Build bar chart for the latest scan (or selected)
      const barData = [];
      if (history.length > 0) {
        const latest = history[0];
        if (latest.Metrics?.findingsBySeverity) {
          for (const [key, val] of Object.entries(latest.Metrics.findingsBySeverity)) {
            barData.push({ name: key, value: val, extra: { scanID: latest.ID } });
          }
        }
      }
      this.barChartData.set(barData);
    });
  }

  clearHistory() {
    const proj = this.project();
    if (!proj) return;

    // if (confirm('Are you sure you want to clear all historical scans? This cannot be undone.')) {
    DeleteProjectScans(proj.ID)
      .then(() => {
        this.loadTrends();
      })
      .catch((err: any) => {
        alert('Error clearing history: ' + err);
      });
    // }
  }

  startEdit() {
    const proj = this.project();
    if (!proj) return;

    this.editName = proj.Name || '';
    this.editWorkspace = proj.Workspace || '';
    this.editDescription = proj.Description || '';

    GetProjects()
      .then((workspaces: any) => {
        const wsSet = new Set<string>();
        if (workspaces && workspaces.Details) {
          Object.keys(workspaces.Details).forEach((ws) => wsSet.add(ws));
        }
        this.availableWorkspaces.set(Array.from(wsSet));
        this.isEditing.set(true);
      })
      .catch((err) => {
        console.error('Failed to load workspaces:', err);
        // Even if it fails, still allow editing
        this.isEditing.set(true);
      });
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveDetails() {
    const proj = this.project();
    if (!proj) return;

    UpdateProjectDetails(proj.ID, this.editName, this.editWorkspace, this.editDescription)
      .then((updated: any) => {
        this.project.set(updated);
        this.isEditing.set(false);
      })
      .catch((err: any) => {
        alert('Error saving project details: ' + err);
      });
  }

  onChartSelect(event: any) {
    let scanID = '';
    let severity = '';

    if (event.extra && event.extra.scanID) {
      scanID = event.extra.scanID;
    }

    if (event.series && event.series !== 'Total Issues') {
      severity = event.series;
    } else if (!event.series && event.name && event.name !== 'Total Issues') {
      severity = event.name;
    }

    this.selectedHistoricalScanID.set(scanID);
    this.selectedSeverityFilter.set(severity);

    if (scanID) {
      this.fetchFindings(this.project().ID, scanID);
    }
    this.activeTab.set('vulnerabilities');
  }

  onBarChartSelect(event: any) {
    const severity = event.name || '';
    const scanID = event.extra?.scanID || '';

    this.selectedSeverityFilter.set(severity);
    this.selectedHistoricalScanID.set(scanID);

    if (scanID) {
      this.fetchFindings(this.project().ID, scanID);
    }
    this.activeTab.set('vulnerabilities');
  }

  onLegendClick(event: any) {
    const legendLabel = typeof event === 'string' ? event : event?.name || event?.label || '';
    if (legendLabel && legendLabel !== 'Total Issues') {
      this.selectedSeverityFilter.set(legendLabel);
      this.activeTab.set('vulnerabilities');
    }
  }

  browseDirectory() {
    SelectDirectory()
      .then((dir: any) => {
        if (dir) {
          this.newRepoLocation = dir;
          this.cdr.detectChanges();
        }
      })
      .catch((err: any) => console.error(err));
  }

  addRepository() {
    const proj = this.project();
    if (!proj || !this.newRepoLocation) return;

    AddRepository(proj.ID, this.newRepoLocation)
      .then((updatedProj) => {
        this.project.set(updatedProj);
        this.newRepoLocation = '';
      })
      .catch((err) => alert('Error adding repo: ' + err));
  }

  removeRepository(repoLocation: string) {
    const proj = this.project();
    if (!proj) return;

    RemoveRepository(proj.ID, repoLocation)
      .then((updatedProj) => {
        this.project.set(updatedProj);
      })
      .catch((err) => alert('Error removing repo: ' + err));
  }

  runScan() {
    const proj = this.project();
    if (!proj) return;

    const pid = proj.id || proj.ID;
    this.routeProjectId = pid;

    // This component now owns the scan lifecycle via the StartScan promise, so
    // the adopted-scan poller would be a second, competing completion source.
    this.stopWatchingAdoptedScan();

    this.findings.set([]);
    this.scanning.set(true);
    // Clear any progress left from a previous scan, or the button would
    // briefly show the last run's percentage before the first event arrives.
    this.scanProgress.set(null);
    this.activeTab.set('vulnerabilities');

    StartScan(proj.ID)
      .then(() => {
        this.scanning.set(false);
        this.scanProgress.set(null);
        this.fetchProject(proj.ID);
      })
      .catch((err) => {
        alert('Error triggering scan: ' + err);
        this.scanning.set(false);
        this.scanProgress.set(null);
      });
  }

  selectFinding(finding: any) {
    this.selectedFinding.set(finding);
    this.suppressReason.set('');
    this.suppressScope.set('globalHash');
    this.onScopeChange();
  }

  onScopeChange() {
    const finding = this.selectedFinding();
    if (!finding) return;

    const scope = this.suppressScope();
    const hash = finding.sha256 || finding.SHA256 || '';
    const source = finding.source || finding.Source || '';
    const loc = finding.location || finding.Location || '';

    this.suppressPath.set(loc);

    if (scope.includes('Hash')) {
      this.suppressMatch.set(hash);
    } else if (scope.includes('Regex')) {
      // Basic escape to make it a literal regex by default
      const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this.suppressMatch.set(escaped);
    } else {
      this.suppressMatch.set(source);
    }
  }

  suppressSelected() {
    const finding = this.selectedFinding();
    const reason = this.suppressReason();
    const match = this.suppressMatch();
    const scope = this.suppressScope();
    const path = this.suppressPath();
    const projID = this.project()?.ID;

    if (!finding || !reason || !match || !projID) return;

    this.suppressing.set(true);

    const opts = {
      scopeType: scope,
      matchString: match,
      path: path,
      reason: reason,
    };

    SuppressFinding(projID, finding, opts as any)
      .then(() => {
        this.suppressing.set(false);
        finding.Excluded = true;
        this.selectedFinding.set(null); // Close the drawer

        this.fetchFindings(projID);
      })
      .catch((err) => {
        alert('Error suppressing finding: ' + err);
        this.suppressing.set(false);
      });
  }

  async loadExceptions() {
    const p = this.project();
    if (!p) return;
    try {
      const ex = await GetExceptions(p.ID);
      this.exceptions.set(ex || []);
    } catch (e) {
      console.error('Failed to load exceptions', e);
    }
  }

  async removeException(id: string) {
    if (!id) {
      alert('Error: Exception ID is undefined or empty!');
      return;
    }
    // if (!confirm("Are you sure you want to remove this exception? It will no longer filter issues on future scans.")) return;
    // Optimistically remove from UI immediately
    this.exceptions.update((list) => list.filter((e) => (e.id || e.ID) !== id));
    try {
      await RemoveException(id);
      // Reload findings so that the removed exception immediately unsuppresses existing findings
      const p = this.project();
      if (p) {
        this.fetchFindings(p.ID || p.id);
      }
    } catch (e) {
      // Restore list if the call failed
      await this.loadExceptions();
      alert('Error removing exception: ' + e);
    }
  }

  async exportExceptions() {
    const p = this.project();
    if (!p) return;
    try {
      await ExportExceptions(p.ID);
      // We don't need to alert on success if the save dialog handles it gracefully
    } catch (e) {
      alert('Error exporting exceptions: ' + e);
    }
  }

  async importExceptions() {
    const p = this.project();
    if (!p) return;
    try {
      await ImportExceptions(p.ID);
      await this.loadExceptions();
    } catch (e) {
      alert('Error importing exceptions: ' + e);
    }
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      if (
        this.selectedFinding() &&
        !this.suppressing() &&
        this.suppressReason() &&
        this.suppressMatch()
      ) {
        this.suppressSelected();
      }
      return;
    }

    if (event.key === 'Escape') {
      if (this.selectedFinding()) {
        this.selectedFinding.set(null);
        event.preventDefault();
      }
      return;
    }

    if (isInput) return;

    if (this.activeTab() === 'vulnerabilities' && this.activeFindings().length > 0) {
      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault();
        const current = this.selectedFinding();
        if (!current) {
          this.selectFinding(this.activeFindings()[0]);
        } else {
          const idx = this.activeFindings().indexOf(current);
          if (idx !== -1 && idx < this.activeFindings().length - 1) {
            this.selectFinding(this.activeFindings()[idx + 1]);
          }
        }
      } else if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault();
        const current = this.selectedFinding();
        if (current) {
          const idx = this.activeFindings().indexOf(current);
          if (idx > 0) {
            this.selectFinding(this.activeFindings()[idx - 1]);
          }
        }
      }
    }
  }
}
