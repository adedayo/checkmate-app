import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  GetDashboardAnalytics,
  GetAppVersion,
  CheckForUpdates,
} from '../../../wailsjs/go/main/App';
import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto space-y-8 pb-12">
      <!-- Auto-Update Notification Banner -->
      @if (updateInfo() && updateInfo()?.available && showUpdateBanner()) {
        <div
          class="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-info to-info p-4 text-primary-foreground shadow-lg flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-foreground/10 rounded-lg shrink-0">
              <svg
                class="w-6 h-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm"
                  >New Release Available: {{ updateInfo()?.latestVersion }}</span
                >
                <span
                  class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-primary-foreground/20 text-primary-foreground font-mono"
                  >Update Ready</span
                >
              </div>
              <p class="text-xs text-primary-foreground/80 mt-0.5">
                CheckMate {{ updateInfo()?.latestVersion }} is now available (Current:
                {{ appVersion() }}).
              </p>
              @if (updateInfo()?.installCommand) {
                <div class="flex items-center gap-2 mt-1.5">
                  <code
                    class="px-2 py-1 rounded bg-primary-foreground/15 text-[11px] font-mono text-primary-foreground"
                    >{{ updateInfo()?.installCommand }}</code
                  >
                  <button
                    (click)="copyInstallCommand()"
                    class="text-[10px] font-bold uppercase px-2 py-1 rounded bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                    title="Copy install command"
                  >
                    {{ commandCopied() ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              }
              @if (updateInfo()?.installHint) {
                <p class="text-[11px] text-primary-foreground/70 mt-1">
                  {{ updateInfo()?.installHint }}
                </p>
              }
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              (click)="openUpdateUrl()"
              class="px-3.5 py-1.5 bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5"
              [title]="downloadTitle()"
            >
              <span>{{ downloadLabel() }}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
            <button
              (click)="dismissUpdateBanner()"
              class="p-1.5 text-primary-foreground/80 hover:text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-colors"
              title="Dismiss"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Top Banner / Header with Global Filters -->
      <div
        class="relative overflow-hidden rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm"
      >
        <div
          class="absolute -right-20 -top-20 w-80 h-80 bg-info/5 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute right-40 bottom-0 w-48 h-48 bg-success/5 rounded-full blur-2xl pointer-events-none"
        ></div>

        <div
          class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span
                class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                CheckMate Security Intelligence
              </span>
              <span class="text-xs text-muted-foreground font-mono">Executive Dashboard</span>
            </div>
            <h1 class="text-3xl font-extrabold text-foreground tracking-tight">
              Secret Exposure Posture
            </h1>
            <p class="text-muted-foreground mt-1 max-w-2xl text-sm md:text-base">
              Unified cross-workspace posture analysis, reused secret detection, environment risk
              profiling, and high-ROI remediation playbook.
            </p>
          </div>

          <!-- Controls & Filters -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Workspace Selector -->
            <div class="flex flex-col">
              <label
                class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1"
                >Workspace</label
              >
              <select
                [(ngModel)]="selectedWorkspace"
                class="px-3.5 py-2 bg-muted border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              >
                <option value="ALL">
                  All Workspaces ({{ rawAnalytics()?.totalWorkspaces || 0 }})
                </option>
                @for (ws of availableWorkspaces(); track ws) {
                  <option [value]="ws">{{ ws }}</option>
                }
              </select>
            </div>

            <!-- Environment Selector -->
            <div class="flex flex-col">
              <label
                class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1"
                >Environment</label
              >
              <select
                [(ngModel)]="selectedEnvironment"
                class="px-3.5 py-2 bg-muted border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              >
                <option value="ALL">All Environments</option>
                <option value="PROD">Production Only</option>
                <option value="NONPROD">Non-Production / Test</option>
              </select>
            </div>

            <!-- Refresh Button -->
            <div class="flex flex-col justify-end">
              <label class="text-[10px] opacity-0 mb-1">Refresh</label>
              <button
                (click)="fetchAnalytics()"
                [disabled]="loading()"
                class="px-3.5 py-2 bg-muted hover:bg-accent text-foreground rounded-lg text-xs font-semibold border border-border transition-colors flex items-center gap-1.5"
              >
                <svg
                  [class.animate-spin]="loading()"
                  class="w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading() && !analytics()) {
        <div
          class="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border"
        >
          <div
            class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"
          ></div>
          <p class="text-sm font-medium text-muted-foreground">
            Loading cross-workspace posture analytics...
          </p>
        </div>
      } @else if (analytics()) {
        <!-- 1. Executive KPI Metrics Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Overall Security Posture Score -->
          <div
            class="relative rounded-xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between text-muted-foreground mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold uppercase tracking-wider"
                    >Overall Posture Score</span
                  >

                  <!-- Rich Popover Tooltip -->
                  <div class="relative group/tooltip inline-block">
                    <button
                      type="button"
                      class="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded focus:outline-none flex items-center"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    <div
                      class="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-72 p-3.5 bg-code text-code-foreground text-xs rounded-xl shadow-2xl border border-code-foreground/10 z-50 pointer-events-none animate-in fade-in duration-150"
                    >
                      <div class="font-bold text-primary mb-1 flex items-center gap-1">
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Overall Posture Score
                      </div>
                      <p class="text-code-foreground/80 leading-relaxed">
                        Weighted security health index across codebases (100% = Pristine).
                      </p>
                      <div
                        class="mt-2 pt-2 border-t border-code-foreground/10 font-mono text-[11px] text-code-foreground/70 space-y-0.5"
                      >
                        <div class="text-code-foreground/80 font-semibold mb-1">
                          Severity Penalties per leak:
                        </div>
                        <div>• Critical: <span class="text-destructive font-bold">-25%</span></div>
                        <div>• High: <span class="text-warning font-bold">-10%</span></div>
                        <div>• Medium: <span class="text-warning">-3%</span></div>
                        <div>• Low: <span class="text-info">-1%</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded"
                  [ngClass]="getScoreBadgeClass(analytics().overallSecurityScore)"
                >
                  {{ getScoreStatusText(analytics().overallSecurityScore) }}
                </span>
              </div>
              <div class="flex items-baseline gap-3 my-2">
                <div
                  class="text-4xl font-extrabold tracking-tight"
                  [ngClass]="getScoreTextColor(analytics().overallSecurityScore)"
                >
                  {{ analytics().overallSecurityScore }}%
                </div>
                <div class="text-xs text-muted-foreground">
                  Across {{ analytics().totalProjects }} codebases
                </div>
              </div>
            </div>
            <div>
              <p class="text-[11px] text-muted-foreground mb-2">
                Weighted code health index (100% = zero active secret leaks).
              </p>
              <div class="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  [ngClass]="getScoreBarClass(analytics().overallSecurityScore)"
                  [style.width.%]="analytics().overallSecurityScore"
                ></div>
              </div>
            </div>
          </div>

          <!-- Total Active Leaks & Severities -->
          <div
            class="rounded-xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between text-muted-foreground mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold uppercase tracking-wider"
                    >Active Secret Leaks</span
                  >

                  <!-- Rich Popover Tooltip -->
                  <div class="relative group/tooltip inline-block">
                    <button
                      type="button"
                      class="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded focus:outline-none flex items-center"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    <div
                      class="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-3.5 bg-code text-code-foreground text-xs rounded-xl shadow-2xl border border-code-foreground/10 z-50 pointer-events-none animate-in fade-in duration-150"
                    >
                      <div class="font-bold text-primary mb-1">Active Secret Leaks</div>
                      <p class="text-code-foreground/80 leading-relaxed">
                        Total active, unmitigated credentials exposed across all scanned projects.
                      </p>
                      <p
                        class="mt-2 text-[11px] text-code-foreground/70 pt-1.5 border-t border-code-foreground/10"
                      >
                        Suppressed false positives are excluded.
                      </p>
                    </div>
                  </div>
                </div>
                <span class="text-xs font-semibold text-muted-foreground font-mono"
                  >{{ analytics().excludedFindings }} Excluded</span
                >
              </div>
              <div class="text-4xl font-extrabold text-foreground tracking-tight my-1">
                {{ analytics().totalFindings }}
              </div>
            </div>
            <div>
              <p class="text-[11px] text-muted-foreground mb-2">
                Unmitigated credentials currently exposed in source code.
              </p>
              <div class="flex items-center gap-2 pt-2 border-t border-border text-xs">
                <span
                  class="px-2 py-0.5 bg-destructive/10 text-destructive font-bold rounded border border-destructive/20"
                >
                  {{ analytics().criticalFindings }} Critical
                </span>
                <span
                  class="px-2 py-0.5 bg-warning/10 text-warning font-bold rounded border border-warning/20"
                >
                  {{ analytics().highFindings }} High
                </span>
                <span class="px-2 py-0.5 bg-muted text-muted-foreground font-medium rounded">
                  {{ analytics().mediumFindings + analytics().lowFindings }} Med/Low
                </span>
              </div>
            </div>
          </div>

          <!-- Reused Secrets Exposure -->
          <div
            class="rounded-xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between text-muted-foreground mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold uppercase tracking-wider">Reused Secret Keys</span>

                  <!-- Rich Popover Tooltip -->
                  <div class="relative group/tooltip inline-block">
                    <button
                      type="button"
                      class="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded focus:outline-none flex items-center"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    <div
                      class="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-3.5 bg-code text-code-foreground text-xs rounded-xl shadow-2xl border border-code-foreground/10 z-50 pointer-events-none animate-in fade-in duration-150"
                    >
                      <div class="font-bold text-highlight mb-1">Lateral Movement Risk</div>
                      <p class="text-code-foreground/80 leading-relaxed">
                        Unique secret keys found across multiple repositories.
                      </p>
                      <p
                        class="mt-2 text-[11px] text-code-foreground/70 pt-1.5 border-t border-code-foreground/10"
                      >
                        Compromise of one repository leaks access to all connected environments.
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded bg-highlight/10 text-highlight border border-highlight/20"
                >
                  Lateral Risk
                </span>
              </div>
              <div class="text-4xl font-extrabold text-highlight tracking-tight my-1">
                {{ analytics().reusedSecretsCount }}
                <span class="text-sm font-semibold text-muted-foreground font-normal">keys</span>
              </div>
            </div>
            <div class="text-xs text-muted-foreground mt-2 font-medium">
              Generating
              <strong class="text-foreground">{{ analytics().reusedSecretLeaks }}</strong> leak
              instances across {{ analytics().totalProjects }} projects
            </div>
          </div>

          <!-- Production vs Non-Production Leak Split -->
          <div
            class="rounded-xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between text-muted-foreground mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold uppercase tracking-wider"
                    >Production Exposure</span
                  >

                  <!-- Rich Popover Tooltip -->
                  <div class="relative group/tooltip inline-block">
                    <button
                      type="button"
                      class="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded focus:outline-none flex items-center"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    <div
                      class="absolute right-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-3.5 bg-code text-code-foreground text-xs rounded-xl shadow-2xl border border-code-foreground/10 z-50 pointer-events-none animate-in fade-in duration-150"
                    >
                      <div class="font-bold text-destructive mb-1">Production Exposure</div>
                      <p class="text-code-foreground/80 leading-relaxed">
                        Secret leaks in production repositories vs non-production/test environments.
                      </p>
                      <p
                        class="mt-2 text-[11px] text-code-foreground/70 pt-1.5 border-t border-code-foreground/10"
                      >
                        Prod leaks require urgent emergency credential rotation.
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded"
                  [ngClass]="
                    analytics().productionLeaks > 0
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-success/10 text-success border border-success/20'
                  "
                >
                  {{ analytics().productionLeaks > 0 ? 'High Priority' : 'Clean' }}
                </span>
              </div>
              <div class="flex items-baseline gap-2 my-1">
                <span class="text-4xl font-extrabold text-destructive tracking-tight">{{
                  analytics().productionLeaks
                }}</span>
                <span class="text-xs text-muted-foreground"
                  >Prod vs {{ analytics().nonProductionLeaks }} Non-Prod</span
                >
              </div>
            </div>
            <div>
              <p class="text-[11px] text-muted-foreground mb-1">
                Prod leaks require urgent credential rotation.
              </p>
              <div class="w-full bg-muted h-2 rounded-full overflow-hidden flex">
                <div
                  class="bg-destructive h-full transition-all"
                  [style.width.%]="getProdRatioPercent()"
                ></div>
                <div
                  class="bg-info h-full transition-all"
                  [style.width.%]="100 - getProdRatioPercent()"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. High Return-on-Investment (ROI) Remediation Playbook -->
        <div class="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-6">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5"
          >
            <div>
              <div class="flex items-center gap-2 mb-1">
                <svg
                  class="w-5 h-5 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h2 class="text-xl font-bold text-foreground">
                  Highest ROI Remediation Priorities
                </h2>
              </div>
              <p class="text-xs md:text-sm text-muted-foreground">
                Focus on these top remediation items to eliminate up to
                <strong class="text-foreground font-bold">{{ maxRoiReductionPercent() }}%</strong>
                of total secret exposure with minimal developer overhead.
              </p>
            </div>
            <span
              class="px-3 py-1 bg-warning/10 text-warning text-xs font-bold rounded-lg border border-warning/20 whitespace-nowrap self-start sm:self-auto"
            >
              Analyst Playbook
            </span>
          </div>

          @if (analytics().topRoiFixes.length === 0) {
            <div class="py-8 text-center text-muted-foreground text-sm">
              ✨ No critical ROI remediation items identified. Your secret exposure posture is well
              managed.
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (roi of analytics().topRoiFixes; track roi.id) {
                <div
                  class="flex flex-col justify-between rounded-xl bg-muted/60 border border-border p-5 hover:border-primary/50 transition-all shadow-sm"
                >
                  <div>
                    <!-- Badge & Impact -->
                    <div class="flex items-center justify-between mb-3">
                      <span
                        class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md"
                        [ngClass]="getRoiBadgeClass(roi.category)"
                      >
                        {{ roi.category }}
                      </span>
                      <span
                        class="text-xs font-mono font-bold text-success flex items-center gap-1"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        -{{ roi.impactPercent | number: '1.1-1' }}% Risk
                      </span>
                    </div>

                    <h3 class="text-base font-bold text-foreground mb-2 leading-snug">
                      {{ roi.title }}
                    </h3>
                    <p class="text-xs text-muted-foreground leading-relaxed mb-4">
                      {{ roi.description }}
                    </p>
                  </div>

                  <!-- Action Bar -->
                  <div
                    class="pt-3 border-t border-border flex items-center justify-between mt-auto"
                  >
                    <span class="text-xs font-semibold text-muted-foreground">
                      Eliminates <strong>{{ roi.impactCount }}</strong>
                      {{ roi.impactCount === 1 ? 'leak' : 'leaks' }}
                    </span>

                    @if (roi.targetProjectId) {
                      <a
                        [routerLink]="['/projects', roi.targetProjectId]"
                        class="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <span>Drill Down</span>
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- 3. Secret Exposure Posture Insights Grid (Prod vs Non-Prod & Secret Categories) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Production vs Non-Production Exposure Analysis -->
          <div
            class="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Environment Risk Distribution
                </h2>
                <span class="text-xs font-mono font-semibold text-muted-foreground"
                  >Prod vs Non-Prod</span
                >
              </div>
              <p class="text-xs text-muted-foreground">
                Production leaks require immediate revocation as they reside in active code.
                Non-production leaks in tests/fixtures require commit history cleaning.
              </p>
            </div>

            <!-- High-Density Progress Bar Stack -->
            <div class="space-y-4">
              <!-- Production Track -->
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-destructive flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-destructive inline-block"></span>
                    Production Code Leaks
                  </span>
                  <span class="text-foreground font-mono"
                    >{{ analytics().productionLeaks }} ({{
                      getProdRatioPercent() | number: '1.0-0'
                    }}%)</span
                  >
                </div>
                <div class="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    class="bg-destructive h-full rounded-full transition-all duration-500"
                    [style.width.%]="getProdRatioPercent()"
                  ></div>
                </div>
              </div>

              <!-- Non-Production Track -->
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-info flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-info inline-block"></span>
                    Non-Production / Test Leaks
                  </span>
                  <span class="text-foreground font-mono"
                    >{{ analytics().nonProductionLeaks }} ({{
                      100 - getProdRatioPercent() | number: '1.0-0'
                    }}%)</span
                  >
                </div>
                <div class="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    class="bg-info h-full rounded-full transition-all duration-500"
                    [style.width.%]="100 - getProdRatioPercent()"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Action Guidance Callout Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div class="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs">
                <span class="font-bold text-destructive block mb-1">🔥 Production Leaks</span>
                <p class="text-foreground">
                  Must be rotated immediately in identity providers (AWS, GitHub, DBs).
                </p>
              </div>
              <div class="p-3.5 rounded-xl bg-info/10 border border-info/20 text-xs">
                <span class="font-bold text-info block mb-1">🧪 Test/Fixture Leaks</span>
                <p class="text-foreground">
                  Rewrite test fixtures with dummy tokens or configure checkmate rules.
                </p>
              </div>
            </div>
          </div>

          <!-- Top Leaked Secret Categories -->
          <div
            class="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Most Leaked Secret Categories
                </h2>
                <span class="text-xs font-mono font-semibold text-muted-foreground"
                  >By Detector ID</span
                >
              </div>
              <p class="text-xs text-muted-foreground">
                Breakdown of secret detector classifications across all scanned projects.
              </p>
            </div>

            <!-- Horizontal Category Bars -->
            <div class="space-y-3.5 py-1">
              @for (cat of analytics().secretCategories; track cat.category) {
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-xs font-semibold">
                    <span class="text-foreground truncate max-w-[240px]">{{ cat.category }}</span>
                    <span class="text-muted-foreground font-mono"
                      >{{ cat.count }} {{ cat.count === 1 ? 'leak' : 'leaks' }}</span
                    >
                  </div>
                  <div class="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      class="bg-primary h-full rounded-full transition-all duration-500"
                      [style.width.%]="getCategoryPercent(cat.count)"
                    ></div>
                  </div>
                </div>
              }
              @if (analytics().secretCategories.length === 0) {
                <div class="text-center py-6 text-muted-foreground text-xs">
                  No secret leak categories detected.
                </div>
              }
            </div>
          </div>
        </div>

        <!-- 4. Interactive Multi-Scan Historical Trend Chart -->
        <div class="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-6">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4"
          >
            <div>
              <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
                Historical Exposure Trends Over Time
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Aggregate leak finding trajectory across historical scan executions.
              </p>
            </div>
            <div class="flex items-center gap-3 text-xs font-semibold">
              <span class="flex items-center gap-1 text-destructive"
                ><span class="w-2.5 h-2.5 rounded-full bg-destructive"></span> Critical</span
              >
              <span class="flex items-center gap-1 text-warning"
                ><span class="w-2.5 h-2.5 rounded-full bg-warning"></span> High</span
              >
              <span class="flex items-center gap-1 text-primary"
                ><span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Total</span
              >
            </div>
          </div>

          <!-- Custom SVG Trend Chart -->
          <div class="relative w-full overflow-x-auto">
            @if (analytics().trends.length < 2) {
              <div class="py-12 text-center text-muted-foreground text-sm">
                📊 More historical scan executions are needed to render trend lines. Run additional
                project scans to populate historical timelines.
              </div>
            } @else {
              <div class="min-w-[600px] h-64 relative">
                <svg
                  class="w-full h-full overflow-visible"
                  viewBox="0 0 800 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25" />
                      <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>

                  <!-- Area Fill -->
                  <polygon [attr.points]="getTrendAreaPoints()" fill="url(#totalGrad)" />

                  <!-- Total Path -->
                  <path
                    [attr.d]="getTrendPath('Total')"
                    fill="none"
                    class="stroke-primary"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Critical Path -->
                  <path
                    [attr.d]="getTrendPath('Critical')"
                    fill="none"
                    class="stroke-severity-critical"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- High Path -->
                  <path
                    [attr.d]="getTrendPath('High')"
                    fill="none"
                    class="stroke-severity-high"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Data Dots -->
                  @for (pt of getTrendDots(); track pt.x) {
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.yTotal"
                      r="4"
                      class="fill-primary stroke-background stroke-2"
                    />
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.yCrit"
                      r="3.5"
                      class="fill-destructive stroke-background stroke-2"
                    />
                  }
                </svg>

                <!-- X Axis Labels -->
                <div
                  class="flex justify-between items-center text-[10px] font-mono text-muted-foreground mt-2"
                >
                  @for (t of analytics().trends; track t.date) {
                    <span>{{ t.date }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- 5. Workspaces & Codebases Risk Ranking Table -->
        <div class="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Workspaces & Codebases Risk Ranking
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Drill down into individual codebases to view specific scan diagnostics and commit
                details.
              </p>
            </div>

            <!-- Table Search Input -->
            <div class="relative min-w-[240px]">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search project or workspace..."
                class="w-full pl-9 pr-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              <svg
                class="w-4 h-4 text-muted-foreground absolute left-3 top-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div class="overflow-x-auto border border-border rounded-xl">
            <table class="w-full text-left text-xs text-foreground">
              <thead
                class="bg-muted/80 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border"
              >
                <tr>
                  <th class="px-4 py-3.5">Codebase / Project</th>
                  <th class="px-4 py-3.5">Workspace</th>
                  <th class="px-4 py-3.5">Posture Score</th>
                  <th class="px-4 py-3.5">Finding Breakdown</th>
                  <th class="px-4 py-3.5">Prod / Non-Prod</th>
                  <th class="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border font-medium">
                @for (proj of filteredProjects(); track proj.projectId) {
                  <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3.5 font-bold text-foreground">
                      {{ proj.projectName }}
                    </td>
                    <td class="px-4 py-3.5 text-muted-foreground font-mono">
                      {{ proj.workspace }}
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center gap-2">
                        <span
                          class="font-extrabold text-xs font-mono"
                          [ngClass]="getScoreTextColor(proj.securityScore)"
                        >
                          {{ proj.securityScore }}%
                        </span>
                        <div class="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all"
                            [ngClass]="getScoreBarClass(proj.securityScore)"
                            [style.width.%]="proj.securityScore"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center gap-1.5">
                        @if (proj.criticalCount > 0) {
                          <span
                            class="px-2 py-0.5 rounded bg-destructive/10 text-destructive font-bold border border-destructive/20 text-[10px]"
                          >
                            {{ proj.criticalCount }} Crit
                          </span>
                        }
                        @if (proj.highCount > 0) {
                          <span
                            class="px-2 py-0.5 rounded bg-warning/10 text-warning font-bold border border-warning/20 text-[10px]"
                          >
                            {{ proj.highCount }} High
                          </span>
                        }
                        @if (proj.totalFindings === 0) {
                          <span class="text-success font-bold text-[10px] flex items-center gap-1">
                            <svg
                              class="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Clean
                          </span>
                        } @else if (proj.criticalCount === 0 && proj.highCount === 0) {
                          <span
                            class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px]"
                          >
                            {{ proj.totalFindings }} Med/Low
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-4 py-3.5 font-mono text-[11px]">
                      <span class="text-destructive font-bold">{{ proj.prodLeaks }}</span>
                      <span class="text-muted-foreground">/</span>
                      <span class="text-info font-bold">{{ proj.nonProdLeaks }}</span>
                    </td>
                    <td class="px-4 py-3.5 text-right">
                      <a
                        [routerLink]="['/projects', proj.projectId]"
                        class="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>View Scan</span>
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                }
                @if (filteredProjects().length === 0) {
                  <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-muted-foreground text-sm">
                      No codebases match the selected filter criteria.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. Cross-Project Reused Secrets Matrix -->
        <div class="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-highlight"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Cross-Project Reused Secrets Inventory
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Secrets leaked across multiple codebases represent severe lateral movement risk if
                compromised.
              </p>
            </div>
            <span
              class="px-3 py-1 bg-highlight/10 text-highlight text-xs font-bold rounded-lg border border-highlight/20 whitespace-nowrap self-start sm:self-auto"
            >
              {{ analytics().reusedSecretsCount }} Unique Reused Keys
            </span>
          </div>

          <div class="overflow-x-auto border border-border rounded-xl">
            <table class="w-full text-left text-xs text-foreground">
              <thead
                class="bg-muted/80 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border"
              >
                <tr>
                  <th class="px-4 py-3.5">Secret Checksum (SHA256)</th>
                  <th class="px-4 py-3.5">Category</th>
                  <th class="px-4 py-3.5">Occurrences</th>
                  <th class="px-4 py-3.5">Affected Codebases</th>
                  <th class="px-4 py-3.5">Sample Location</th>
                  <th class="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border font-medium">
                @for (rs of analytics().topReusedSecrets; track rs.checksum) {
                  <tr class="hover:bg-accent/50 transition-colors">
                    <td class="px-4 py-3.5 font-mono text-highlight font-bold">
                      {{ truncate(rs.checksum, 12) }}...
                    </td>
                    <td class="px-4 py-3.5 text-foreground font-semibold">
                      {{ rs.secretType }}
                    </td>
                    <td class="px-4 py-3.5">
                      <span
                        class="px-2.5 py-1 bg-highlight/10 text-highlight font-bold rounded-md border border-highlight/20 text-xs"
                      >
                        {{ rs.occurrences }} files
                      </span>
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex flex-wrap gap-1 max-w-xs">
                        @for (pname of rs.projectNames; track pname) {
                          <span
                            class="px-2 py-0.5 bg-muted text-foreground text-[10px] font-medium rounded"
                          >
                            {{ pname }}
                          </span>
                        }
                      </div>
                    </td>
                    <td
                      class="px-4 py-3.5 text-muted-foreground font-mono text-[11px] truncate max-w-[200px]"
                      [title]="rs.samplePath"
                    >
                      {{ rs.samplePath || 'N/A' }}
                    </td>
                    <td class="px-4 py-3.5 text-right">
                      @if (rs.projectIds && rs.projectIds.length > 0) {
                        <a
                          [routerLink]="['/projects', rs.projectIds[0]]"
                          class="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Inspect</span>
                          <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      }
                    </td>
                  </tr>
                }
                @if (analytics().topReusedSecrets.length === 0) {
                  <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-muted-foreground text-sm">
                      ✨ No reused secrets detected across projects.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  rawAnalytics = signal<any>(null);
  loading = signal<boolean>(true);

  selectedWorkspace = signal<string>('ALL');
  selectedEnvironment = signal<string>('ALL');
  searchQuery = signal<string>('');
  appVersion = signal<string>('v2.1.0-DEV');
  updateInfo = signal<any>(null);
  showUpdateBanner = signal<boolean>(true);

  ngOnInit() {
    this.fetchAnalytics();
    this.fetchVersion();
    this.checkForUpdates();
  }

  fetchVersion() {
    try {
      GetAppVersion()
        .then((v) => {
          if (v) this.appVersion.set(v);
        })
        .catch(() => {});
    } catch (e) {}
  }

  checkForUpdates() {
    try {
      CheckForUpdates()
        .then((info: any) => {
          if (info) this.updateInfo.set(info);
        })
        .catch(() => {});
    } catch (e) {}
  }

  dismissUpdateBanner() {
    this.showUpdateBanner.set(false);
  }

  commandCopied = signal<boolean>(false);

  // The button says what it will do. When the release carries an artefact for
  // this platform we name it; otherwise it opens the release page, and saying
  // "Download" of a page that downloads nothing would be a lie.
  downloadLabel = computed(() => (this.updateInfo()?.assetName ? 'Download' : 'View Release'));

  downloadTitle = computed(() => {
    const info = this.updateInfo();
    if (!info) return '';
    return info.assetName
      ? `Download ${info.assetName} for ${info.platform}`
      : `No prebuilt artefact for ${info.platform ?? 'this platform'} — open the release page`;
  });

  copyInstallCommand() {
    const command = this.updateInfo()?.installCommand;
    if (!command) return;
    navigator.clipboard
      ?.writeText(command)
      .then(() => {
        this.commandCopied.set(true);
        setTimeout(() => this.commandCopied.set(false), 2000);
      })
      .catch(() => {});
  }

  openUpdateUrl() {
    const info = this.updateInfo();
    if (info) {
      const url = info.downloadUrl || info.htmlUrl;
      if (url) {
        BrowserOpenURL(url);
      }
    }
  }

  fetchAnalytics() {
    this.loading.set(true);
    GetDashboardAnalytics()
      .then((data: any) => {
        this.rawAnalytics.set(data);
        this.loading.set(false);
      })
      .catch((err) => {
        console.warn('Error fetching dashboard analytics:', err);
        this.loading.set(false);
      });
  }

  // Workspaces for dropdown
  availableWorkspaces = computed(() => {
    const raw = this.rawAnalytics();
    if (!raw || !raw.workspaceBreakdown) return [];
    return raw.workspaceBreakdown.map((w: any) => w.workspaceName);
  });

  // Dynamically filtered analytics based on selectedWorkspace & selectedEnvironment
  analytics = computed(() => {
    const raw = this.rawAnalytics();
    if (!raw) return null;

    const wsFilter = this.selectedWorkspace();
    const envFilter = this.selectedEnvironment();

    if (wsFilter === 'ALL' && envFilter === 'ALL') {
      return raw;
    }

    // Filter Project Breakdown
    let projects = raw.projectBreakdown || [];
    if (wsFilter !== 'ALL') {
      projects = projects.filter((p: any) => p.workspace === wsFilter);
    }

    let totFindings = 0,
      crit = 0,
      high = 0,
      med = 0,
      low = 0;
    let prodLeaks = 0,
      nonProdLeaks = 0;

    projects.forEach((p: any) => {
      if (envFilter === 'ALL') {
        totFindings += p.totalFindings;
        crit += p.criticalCount;
        high += p.highCount;
        med += p.mediumCount;
        low += p.lowCount;
        prodLeaks += p.prodLeaks;
        nonProdLeaks += p.nonProdLeaks;
      } else if (envFilter === 'PROD') {
        totFindings += p.prodLeaks;
        crit += p.criticalCount; // estimate
        high += p.highCount;
        prodLeaks += p.prodLeaks;
      } else if (envFilter === 'NONPROD') {
        totFindings += p.nonProdLeaks;
        med += p.mediumCount;
        low += p.lowCount;
        nonProdLeaks += p.nonProdLeaks;
      }
    });

    const score =
      projects.length > 0
        ? Math.round(
            projects.reduce((acc: number, p: any) => acc + p.securityScore, 0) / projects.length,
          )
        : 100;

    return {
      ...raw,
      totalProjects: projects.length,
      totalFindings: totFindings,
      criticalFindings: crit,
      highFindings: high,
      mediumFindings: med,
      lowFindings: low,
      productionLeaks: prodLeaks,
      nonProductionLeaks: nonProdLeaks,
      overallSecurityScore: score,
      projectBreakdown: projects,
    };
  });

  filteredProjects = computed(() => {
    const data = this.analytics();
    if (!data || !data.projectBreakdown) return [];
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return data.projectBreakdown;
    return data.projectBreakdown.filter(
      (p: any) => p.projectName.toLowerCase().includes(q) || p.workspace.toLowerCase().includes(q),
    );
  });

  // Helpers
  getProdRatioPercent(): number {
    const data = this.analytics();
    if (!data || data.productionLeaks + data.nonProductionLeaks === 0) return 0;
    return (data.productionLeaks / (data.productionLeaks + data.nonProductionLeaks)) * 100;
  }

  getCategoryPercent(count: number): number {
    const data = this.analytics();
    if (!data || data.totalFindings === 0) return 0;
    return (count / data.totalFindings) * 100;
  }

  maxRoiReductionPercent(): string {
    const data = this.analytics();
    if (!data || !data.topRoiFixes || data.topRoiFixes.length === 0) return '0';
    const sumPct = data.topRoiFixes.reduce((acc: number, item: any) => acc + item.impactPercent, 0);
    return Math.min(Math.round(sumPct), 100).toString();
  }

  getScoreStatusText(score: number): string {
    if (score >= 90) return 'OPTIMAL';
    if (score >= 70) return 'MODERATE RISK';
    if (score >= 50) return 'HIGH EXPOSURE';
    return 'CRITICAL EXPOSURE';
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 90) return 'bg-success/10 text-success border border-success/20';
    if (score >= 70) return 'bg-info/10 text-info border border-info/20';
    if (score >= 50) return 'bg-warning/10 text-warning border border-warning/20';
    return 'bg-destructive/10 text-destructive border border-destructive/20';
  }

  getScoreTextColor(score: number): string {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-info';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  }

  getScoreBarClass(score: number): string {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-info';
    if (score >= 50) return 'bg-warning';
    return 'bg-destructive';
  }

  getRoiBadgeClass(cat: string): string {
    if (cat === 'ReusedSecret') return 'bg-highlight/10 text-highlight border border-highlight/20';
    if (cat === 'HotspotFile') return 'bg-warning/10 text-warning border border-warning/20';
    return 'bg-destructive/10 text-destructive border border-destructive/20';
  }

  truncate(str: string, len: number): string {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) : str;
  }

  // SVG Trend Path Calculations
  getTrendAreaPoints(): string {
    const dots = this.getTrendDots();
    if (dots.length === 0) return '';
    const firstX = dots[0].x;
    const lastX = dots[dots.length - 1].x;
    const linePts = dots.map((d) => `${d.x},${d.yTotal}`).join(' ');
    return `${firstX},180 ${linePts} ${lastX},180`;
  }

  getTrendPath(type: string): string {
    const dots = this.getTrendDots();
    if (dots.length === 0) return '';
    return (
      'M ' +
      dots
        .map((d) => {
          let y = d.yTotal;
          if (type === 'Critical') y = d.yCrit;
          if (type === 'High') y = d.yHigh;
          return `${d.x} ${y}`;
        })
        .join(' L ')
    );
  }

  getTrendDots(): Array<{ x: number; yTotal: number; yCrit: number; yHigh: number }> {
    const data = this.analytics();
    if (!data || !data.trends || data.trends.length === 0) return [];

    const maxVal = Math.max(...data.trends.map((t: any) => t.total || 1), 10);
    const count = data.trends.length;
    const width = 800;
    const height = 160; // 20px padding top/bottom

    return data.trends.map((t: any, idx: number) => {
      const x = count === 1 ? width / 2 : (idx / (count - 1)) * (width - 40) + 20;
      const yTotal = height - (t.total / maxVal) * 140 + 10;
      const yCrit = height - ((t.critical || 0) / maxVal) * 140 + 10;
      const yHigh = height - ((t.high || 0) / maxVal) * 140 + 10;
      return { x, yTotal, yCrit, yHigh };
    });
  }
}
