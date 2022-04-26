/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faEdit, faSave, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { NgxIsElectronService } from 'ngx-is-electron';
// import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Project, RepoType } from '../models/project';
import { ProjectDescription, ProjectSummary, Repository } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { ElectronIPC } from '../services/electron.service';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit, OnDestroy {

  faEdit = faEdit;
  faAdd = faPlus;
  faSave = faSave;
  faDelete = faTrashAlt;
  appName = 'CheckMate';
  showNewRepo = false;

  existingWorkspaces: string[] = ['Default'];
  spinForProject: boolean;
  spinForProjectSummary: boolean;
  project: Project;
  project$: Subscription;
  projectForm: FormGroup;
  isInElectron: boolean;

  repoTypes: RepoType[] = [
    { type: 'git', value: 'git' },
    { type: 'filesystem', value: 'filesystem' },
  ];
  selectedType = 'git';
  apiKeyIDs: keyID[] = [];
  initialNewRepoValues: any;
  subscriptions: Subscription;

  constructor(private fb: FormBuilder, private router: Router,
    private ipc: ElectronIPC,
    private checkMateService: CheckMateService, private electronService: NgxIsElectronService) {
    this.isInElectron = this.electronService.isElectronApp;
  }



  ngOnInit(): void {
    const path = this.router.url;
    this.subscriptions = new Subscription();
    if (path) {
      //get project ID from the route
      const subPaths = path.split('/');
      const projectID = subPaths[subPaths.length - 1];
      this.refreshProject(projectID);

      this.subscriptions.add(this.checkMateService.getWorkspaceSummaries().subscribe(w => {
        if (w.Details) {

          this.existingWorkspaces = [];
          for (const k of Object.keys(w.Details)) {
            if (k === '') {
              this.existingWorkspaces.push('Default');
            } else {
              this.existingWorkspaces.push(k);
            }
          }
          this.existingWorkspaces = this.existingWorkspaces.filter(this.uniqueFilter);
        }

        this.projectForm = this.fb.group({
          projectName: [this.project.Name, Validators.required],
          workspace: [this.project.Workspace],
          newWorkspaceValue: [''],
          // newRepoType: ['git'],
          newRepository: this.fb.group({
            location: [''],
            locationType: ['git'],
            requiresAuth: [false],
            authProvider: [''],
            monitor: [true]
          }),
          repositories: this.reposToControls(),
          scanOptions: this.fb.group({
            showSource: [true],
            confidentialFilesOnly: [false],
            calculateChecksums: [true],
            excludeTestFiles: [false],
          }),
          scanPolicy: this.fb.group({
            configured: [false],
            id: [this.project.ScanPolicy.ID],
            x: [this.project.ScanPolicy.Policy],
            policy: [this.project.ScanPolicy.PolicyString],
          }),
        });
        this.initialNewRepoValues = this.projectForm.get('newRepository').value;
      }));


      this.subscriptions.add(this.checkMateService.getGitHubIntegrations().subscribe(x => {

        this.apiKeyIDs.push(...x.map(y => ({
          apiKeyName: y.Name,
          gitServiceID: y.ID
        })));

        this.subscriptions.add(this.checkMateService.getGitLabIntegrations().subscribe(z => {
          this.apiKeyIDs.push(...z.map(y => ({
            apiKeyName: y.Name,
            gitServiceID: y.ID
          })));
        }));
      }));


    }

  }

  getPolicyConfigured(): boolean {
    return this.projectForm.get('scanPolicy.configured').value as boolean;
  }

  getNewRepoRequiresAuth(): boolean {
    return this.newRepository.get('requiresAuth').value as boolean;
  }

  getNewRepoType(): string {
    return this.newRepository.get('locationType').value as string;
  }

  get newRepository(): FormGroup {
    return this.projectForm.get('newRepository') as FormGroup;
  }

  reposToControls(): FormArray {
    const g: FormGroup[] = [];
    this.project.Repositories.forEach(r => {
      g.push(this.fb.group({
        location: [r.Location],
        locationType: [r.LocationType],
        monitor: [r.Monitor],
        authProvider: [r.GitServiceID],
      }));
    });
    return this.fb.array(g);
  }

  deleteRepo(index: number) {
    this.repositories.removeAt(index);
  }


  uniqueFilter(value: string, index: number, self: string[]): boolean {
    return self.indexOf(value) === index;
  }

  refreshProject(projectID: string) {
    this.spinForProject = true;
    this.spinForProjectSummary = true;
    this.subscriptions.add(this.checkMateService.getProject(projectID).subscribe(proj => {
      this.setProject(proj);
      this.spinForProject = false;
    }));
  }

  get repositories(): FormArray {
    const repos = this.projectForm.controls.repositories;
    if (repos) {
      return repos as FormArray;
    }
    return this.fb.array([]);
  }

  setProject(proj: Project) {
    if (!proj || proj.ID === '') {
      return;
    }
    this.project = proj;
  }

  clearNewRepo() {
    this.showNewRepo = false;
    this.newRepository.reset(this.initialNewRepoValues);
  }

  addNewRepo() {
    if (this.newRepository.valid) {
      const locationType = this.newRepository.get('locationType').value as string;
      const repo: Repository = {
        Location: this.newRepository.get('location').value as string,
        LocationType: locationType,
        Monitor: locationType === 'git' ? this.newRepository.get('monitor').value as boolean : false,
        GitServiceID: this.newRepository.get('authProvider').value as string,
      };

      this.project.Repositories.push(repo);
      (this.projectForm.get('repositories') as FormArray).push(this.fb.group({
        location: [repo.Location],
        locationType: [repo.LocationType],
        monitor: [repo.Monitor],
        authProvider: [repo.GitServiceID],
      }));
      this.clearNewRepo();
    }
  }

  updateProject() {
    const newWs = this.projectForm.get('newWorkspaceValue').value as string;
    const ws = newWs === '' ? this.projectForm.get('workspace').value as string : newWs;
    const projDesc: ProjectDescription = {
      Name: this.projectForm.get('projectName').value as string,
      Workspace: ws,
      Repositories: this.extractRepos(),
      ScanPolicy: {
        ID: this.project.ScanPolicy.ID,
        PolicyString: this.projectForm.get('scanPolicy.policy').value as string,
        // Policy: this.project.ScanPolicy.Policy,
        Config: this.project.ScanPolicy.Config,
      },
    };

    // console.log(projDesc);

    this.subscriptions.add(this.checkMateService.updateProject(this.project.ID, projDesc).subscribe(x => {
      this.router.navigate(['project-detail', x.ID]);
    }));

  }

  extractRepos(): Repository[] {
    const repos: Repository[] = [];
    const rs: FormArray = this.projectForm.controls.repositories as FormArray;

    rs.controls.forEach(rc => {
      const repo: Repository = {
        Location: rc.get('location').value as string,
        LocationType: rc.get('locationType').value as string,
        Monitor: rc.get('monitor').value as boolean,
        GitServiceID: rc.get('authProvider').value as string,
      };
      repos.push(repo);
    });

    return repos;
  }


  getCodePath() {
    this.ipc.getCodePath().then(
      path => {
        let codebase = '';
        if (path.length > 0) {
          codebase = path[0];
        }
        this.newRepository.patchValue({
          location: codebase,
        });

      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}



interface keyID { apiKeyName: string; gitServiceID: string };
