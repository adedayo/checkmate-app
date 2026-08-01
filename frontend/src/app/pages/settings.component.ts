import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetAISettings, UpdateAISettings } from '../../../wailsjs/go/main/App';
import { store } from '../../../wailsjs/go/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto py-8">
      <div class="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        
        <div class="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span>AI Triage Settings</span>
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure Bring-Your-Own-Key AI to automatically triage your findings.</p>
        </div>

        <div class="px-6 py-6 space-y-6">
          @if (loading()) {
            <div class="flex justify-center py-8">
              <svg class="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          } @else {
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Enable AI Triage</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Turn on AI analysis for findings.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" [(ngModel)]="settings.enabled">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              
              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provider</label>
                <select [(ngModel)]="settings.provider" class="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
                  <option value="ollama">Ollama (Local)</option>
                  <option value="openai">OpenAI</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="custom">Custom (OpenAI Compatible)</option>
                </select>
              </div>

              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                <input type="text" [(ngModel)]="settings.model" placeholder="e.g. gpt-4o-mini or llama3.1" class="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base URL</label>
                <input type="text" [(ngModel)]="settings.baseUrl" placeholder="e.g. http://127.0.0.1:11434/v1 or https://api.openai.com/v1" class="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Must include the API version path if required by the provider.</p>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
                <input type="password" [(ngModel)]="settings.apiKey" placeholder="Leave blank if using local unauthenticated endpoint" class="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Prompt Mode</label>
                <select [(ngModel)]="settings.defaultPromptMode" class="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
                  <option value="REDACTED">REDACTED (Safe - Default)</option>
                  <option value="RAW_VALUE">RAW_VALUE (Local endpoints only)</option>
                </select>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">RAW_VALUE sends the actual detected secret to the AI. The engine will automatically downgrade to REDACTED if a public/cloud endpoint is detected, even if RAW_VALUE is selected here.</p>
              </div>

            </div>
          }
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <div class="flex items-center space-x-3">
            @if (saveSuccess()) {
              <span class="text-sm text-emerald-600 dark:text-emerald-400 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Saved successfully
              </span>
            }
            @if (saveError()) {
              <span class="text-sm text-rose-600 dark:text-rose-400 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Failed to save
              </span>
            }
            <button (click)="saveSettings()" [disabled]="saving()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              @if (saving()) {
                <span>Saving...</span>
              } @else {
                <span>Save Settings</span>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settings: store.AISettings = new store.AISettings({
    enabled: false,
    provider: 'ollama',
    model: 'llama3',
    baseUrl: 'http://127.0.0.1:11434/v1',
    apiKey: '',
    defaultPromptMode: 'REDACTED'
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
