import { Component, signal, OnInit } from '@angular/core';
import { GetProjects, CreateProject } from '../../../wailsjs/go/main/App';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HlmImports } from '../shared/ui';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, FormsModule, CommonModule, ...HlmImports],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      <section hlmCard class="gap-0 py-6">
        <div hlmCardHeader>
          <h2 hlmCardTitle class="text-2xl">Projects</h2>
          <p hlmCardDescription>Manage your CheckMate projects</p>
        </div>
      </section>

      <section hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle class="text-lg">Create New Project</h3>
          <p hlmCardDescription>
            A project is a logical grouping of one or more repositories that share the same security
            policies and are scanned together.
          </p>
        </div>

        <div hlmCardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label hlmLabel>Project Name</label>
            <input
              hlmInput
              type="text"
              [(ngModel)]="newProjectName"
              placeholder="e.g. Core Backend Services"
            />
            <p hlmMuted class="text-xs">A human-friendly name for this project.</p>
          </div>
          <div class="space-y-2">
            <label hlmLabel>Workspace</label>
            <input
              hlmInput
              type="text"
              [(ngModel)]="newProjectWorkspace"
              placeholder="e.g. Engineering"
            />
            <p hlmMuted class="text-xs">
              Optional. Use workspaces to group related projects together (like a team name or
              department).
            </p>
          </div>
        </div>

        <div hlmCardFooter class="justify-end">
          <button hlmBtn (click)="createProject()" [disabled]="!newProjectName">
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Project
          </button>
        </div>
      </section>

      <section hlmCard class="overflow-hidden p-0 py-0 gap-0">
        <table class="w-full text-left">
          <thead class="bg-muted/50 border-b">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Project Name</th>
              <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Workspace</th>
              <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Last Scanned</th>
              <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (proj of projects(); track proj.ID) {
              <tr
                (click)="goToProject(proj.ID)"
                class="hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <td class="px-6 py-4 font-medium">{{ proj.Name }}</td>
                <td class="px-6 py-4 text-muted-foreground">{{ proj.Workspace }}</td>
                <td class="px-6 py-4 text-muted-foreground">
                  @if (proj.LastScan && !proj.LastScan.startsWith('0001-01-01')) {
                    {{ proj.LastScan | date: 'medium' }}
                  } @else {
                    Never
                  }
                </td>
                <td class="px-6 py-4 text-right">
                  <a hlmBtn variant="link" size="sm" [routerLink]="['/projects', proj.ID]"
                    >Manage &rarr;</a
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-muted-foreground">
                  No projects found. Create one above.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
})
export class ProjectsComponent implements OnInit {
  projects = signal<any[]>([]);
  newProjectName = '';
  newProjectWorkspace = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchProjects();
  }

  fetchProjects(retries = 3) {
    try {
      GetProjects()
        .then((data: any) => {
          const sorted = (data || []).sort((a: any, b: any) => {
            const dateA = new Date(a.LastScan || a.lastScan || 0).getTime();
            const dateB = new Date(b.LastScan || b.lastScan || 0).getTime();
            return dateB - dateA;
          });
          this.projects.set(sorted);
        })
        .catch((err) => {
          console.warn('Failed to fetch projects', err);
        });
    } catch (e) {
      if (retries > 0) {
        setTimeout(() => this.fetchProjects(retries - 1), 200);
      } else {
        console.warn('Wails IPC not available. Are you viewing in a standard browser?');
      }
    }
  }

  goToProject(id: string) {
    this.router.navigate(['/projects', id]);
  }

  createProject() {
    if (!this.newProjectName) return;

    try {
      CreateProject(this.newProjectName, this.newProjectWorkspace)
        .then(() => {
          this.newProjectName = '';
          this.newProjectWorkspace = '';
          this.fetchProjects(); // Refresh the list
        })
        .catch((err) => {
          alert('Error creating project: ' + err);
        });
    } catch (e: any) {
      alert(
        'Wails IPC is not available. Please ensure you are viewing this app within the CheckMate Desktop App, not a standard browser. Error: ' +
          e.message,
      );
    }
  }
}
