import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetAISettings, UpdateAISettings } from '../../../wailsjs/go/main/App';
import { store } from '../../../wailsjs/go/models';
import { HlmImports } from '../shared/ui';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ...HlmImports],
  template: `
    <div class="max-w-3xl mx-auto py-8">
      <section hlmCard class="overflow-hidden gap-0 py-0">
        <div hlmCardHeader class="py-5 border-b">
          <h2 hlmCardTitle class="text-xl flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
            <span>AI Triage Settings</span>
          </h2>
          <p hlmCardDescription>
            Configure Bring-Your-Own-Key AI to automatically triage your findings.
          </p>
        </div>

        <div hlmCardContent class="py-6 space-y-6">
          @if (loading()) {
            <div class="flex justify-center py-8">
              <svg
                class="animate-spin h-6 w-6 text-muted-foreground"
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
            </div>
          } @else {
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium">Enable AI Triage</h3>
                <p hlmMuted class="text-xs">Turn on AI analysis for findings.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" [(ngModel)]="settings.enabled" />
                <div
                  class="w-11 h-6 bg-input rounded-full peer transition-colors peer-checked:bg-success peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                ></div>
              </label>
            </div>

            <div hlmSeparator></div>

            <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div class="sm:col-span-1 space-y-1.5">
                <label hlmLabel>Provider</label>
                <select hlmSelect [(ngModel)]="settings.provider">
                  <option value="ollama">Ollama (Local)</option>
                  <option value="openai">OpenAI</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="custom">Custom (OpenAI Compatible)</option>
                </select>
              </div>

              <div class="sm:col-span-1 space-y-1.5">
                <label hlmLabel>Model Name</label>
                <input
                  hlmInput
                  type="text"
                  [(ngModel)]="settings.model"
                  placeholder="e.g. gpt-4o-mini or llama3.1"
                />
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label hlmLabel>Base URL</label>
                <input
                  hlmInput
                  type="text"
                  [(ngModel)]="settings.baseUrl"
                  placeholder="e.g. http://127.0.0.1:11434/v1 or https://api.openai.com/v1"
                />
                <p hlmMuted class="text-xs">
                  Must include the API version path if required by the provider.
                </p>
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label hlmLabel>API Key</label>
                <input
                  hlmInput
                  type="password"
                  [(ngModel)]="settings.apiKey"
                  placeholder="Leave blank if using local unauthenticated endpoint"
                />
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label hlmLabel>Default Prompt Mode</label>
                <select hlmSelect [(ngModel)]="settings.defaultPromptMode">
                  <option value="REDACTED">REDACTED (Safe - Default)</option>
                  <option value="RAW_VALUE">RAW_VALUE (Local endpoints only)</option>
                </select>
                <p hlmMuted class="text-xs">
                  RAW_VALUE sends the actual detected secret to the AI. The engine will
                  automatically downgrade to REDACTED if a public/cloud endpoint is detected, even
                  if RAW_VALUE is selected here.
                </p>
              </div>
            </div>
          }
        </div>

        <div hlmCardFooter class="py-4 bg-muted/40 border-t justify-end gap-3">
          @if (saveSuccess()) {
            <span hlmBadge variant="success">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Saved successfully
            </span>
          }
          @if (saveError()) {
            <span hlmBadge variant="destructive">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              Failed to save
            </span>
          }
          <button hlmBtn (click)="saveSettings()" [disabled]="saving()">
            @if (saving()) {
              <span>Saving...</span>
            } @else {
              <span>Save Settings</span>
            }
          </button>
        </div>
      </section>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  settings: store.AISettings = new store.AISettings({
    enabled: false,
    provider: 'ollama',
    model: 'llama3',
    baseUrl: 'http://127.0.0.1:11434/v1',
    apiKey: '',
    defaultPromptMode: 'REDACTED',
  });

  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);
  saveError = signal<boolean>(false);

  ngOnInit() {
    this.loadSettings();
  }

  async loadSettings() {
    this.loading.set(true);
    try {
      const s = await GetAISettings();
      if (s) {
        this.settings = s;
      }
    } catch (err) {
      console.error('Failed to load AI settings', err);
    } finally {
      this.loading.set(false);
    }
  }

  async saveSettings() {
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(false);

    try {
      await UpdateAISettings(this.settings);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } catch (err) {
      console.error('Failed to save AI settings', err);
      this.saveError.set(true);
      setTimeout(() => this.saveError.set(false), 3000);
    } finally {
      this.saving.set(false);
    }
  }
}
