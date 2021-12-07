/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { GitService } from '../models/git';
import { GitLabPagedSearch, GitLabProject, GitLabProjectSearchResult } from '../models/gitlab-project';
import { ProjectSubForm } from '../models/project';
import { ProjectDescription, Repository, ScanPolicy, SecretSearchOptions } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { ProjectFormsService } from '../services/project-forms.service';

@Component({
  selector: 'app-gitlab-repos',
  templateUrl: './gitlab-repos.component.html',
  styleUrls: ['./gitlab-repos.component.scss']
})
export class GitlabReposComponent implements OnInit {

  faSearch = faSearch;
  projectSearch = '';
  existingWorkspaces: string[] = ['Default'];
  projectForm: FormGroup;
  serviceForm: FormGroup;
  showSpinner = false;
  currentInstance = '';
  instanceName = '';
  selectedService: GitService;
  gitLabServices: GitService[] = [];
  nextCursors: Map<string, string> = new Map();//pagination per gitlab instance
  // gitlabProjects: Map<string, GitLabProjectSearchResult> = new Map();
  instance$: any;

  get gitlabProjects(): Map<string, GitLabProjectSearchResult> {
    return this.checkMateService.gitLabProjects;
  }

  get projects(): GitLabProject[] {
    const projs = this.gitlabProjects.get(this.currentInstance);
    return projs ? projs.Projects : [];
  }

  get remainingProjCount(): number {
    if (this.hasMoreData(this.currentInstance)) {

      const projs = this.gitlabProjects.get(this.currentInstance);
      return projs ? projs.RemainingProjectsCount : 0;
    }
    return 0;
  }

  get currentInstanceName() {
    return this.getInstanceName(this.currentInstance);
  }

  set currentInstanceName(name: string) {
    this.instanceName = name;
  }

  get nextCursor(): string {
    return this.nextCursors.get(this.currentInstance) || '';
  }




  selectedProjects: Map<string, ProjectSubForm>;

  constructor(private fb: FormBuilder,
    private checkMateService: CheckMateService,
    private formService: ProjectFormsService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.showSpinner = true;
    this.serviceForm = this.fb.group({
      selectedService: [''],
    });

    this.formService.projectsDetailState.subscribe(proj => {
      this.selectedProjects = proj;
    });

    this.checkMateService.getDefaultPolicy().subscribe(pol => {
      this.projectForm = this.fb.group({
        projectName: ['', Validators.required],
        workspace: ['Default'],
        newWorkspaceValue: [''],
        repositories: this.fb.array([]),
        scanOptions: this.fb.group({
          showSource: [true],
          confidentialFilesOnly: [false],
          calculateChecksums: [true],
          excludeTestFiles: [false],
        }),
        scanPolicy: this.fb.group({
          configured: [false],
          policy: [pol],
        }),
      });

      this.checkMateService.getWorkspaceSummaries().subscribe(w => {
        if (w.Details) {

          this.existingWorkspaces = [];
          for (const k of Object.keys(w.Details)) {
            if (k === '') {
              this.existingWorkspaces.push('Default');
            } else {
              this.existingWorkspaces.push(k);
            }
          }
        }
      });
    });

    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      workspace: ['Default'],
      newWorkspace: [false],
      newWorkspaceValue: [''],
      repositories: this.fb.array([]),
      scanOptions: this.fb.group({
        showSource: [true],
        confidentialFilesOnly: [false],
        calculateChecksums: [true],
        excludeTestFiles: [false],
      }),
      // scanPolicy: this.fb.group({
      //   configured: [false],
      //   policy: [''],
      // }),
    });

    this.instance$ = this.serviceForm.get('selectedService').valueChanges.subscribe(name => {
      if (this.currentInstanceName === name) {
        return;
      }
      const sid = this.gitLabServices.find(y => y.Name === name);
      if (sid) {
        this.currentInstance = sid.ID;
        if (!this.gitlabProjects.has(this.currentInstance)) {
          this.getMoreProjects();
        }
      }

    });

    this.checkMateService.getGitLabIntegrations().subscribe(
      x => {
        this.gitLabServices = x;
        if (x.length > 0) {
          this.currentInstance = x[0].ID;
          this.currentInstanceName = x[0].Name;
          this.serviceForm.patchValue({ selectedService: this.currentInstanceName });


          if (!this.gitlabProjects.has(this.currentInstance)) {
            this.getMoreProjects();
            // const page: GitLabPagedSearch = {
            //   ServiceID: this.currentInstance,
            //   NextCursor: '',
            //   First: 7,
            //   PageSize: 100
            // };

            // this.checkMateService.gitLabDiscover(page).subscribe(data => {

            //   if (this.gitlabProjects.has(data.InstanceID)) {
            //     this.gitlabProjects.set(data.InstanceID, this.getSearchResult(data));
            //   } else {
            //     this.gitlabProjects.set(data.InstanceID, data);
            //   }
            //   this.showSpinner = false;
            //   this.setNextCursor(data.InstanceID, data.EndCursor);
            // });
          } else {
            this.showSpinner = false;
          }

        }
      }
    );

  }

  getSearchResult(data: GitLabProjectSearchResult): GitLabProjectSearchResult {
    const projs = this.gitlabProjects.get(data.InstanceID);
    projs.Projects.push(...data.Projects);
    projs.EndCursor = data.EndCursor;
    projs.HasNextPage = data.HasNextPage;
    projs.InstanceID = data.InstanceID;
    projs.RemainingProjectsCount = data.RemainingProjectsCount;
    return projs;
  }

  showGetMoreButton(): boolean {
    return this.hasMoreData(this.currentInstance);
  }

  hasMoreData(serviceID: string): boolean {
    const s = this.gitlabProjects.get(serviceID);
    if (s === undefined) {
      return false;
    }
    return s.HasNextPage;
  }

  getMoreProjects() {

    const nextC = this.nextCursors.get(this.currentInstance) || '';

    if (nextC === '' || this.hasMoreData(this.currentInstance)) {
      const page: GitLabPagedSearch = {
        ServiceID: this.currentInstance,
        NextCursor: nextC,
        First: 7,
        PageSize: 100
      };
      this.showSpinner = true;
      this.checkMateService.gitLabDiscover(page).subscribe(data => {

        if (this.gitlabProjects.has(data.InstanceID)) {
          this.gitlabProjects.set(data.InstanceID, this.getSearchResult(data));
        } else {
          this.gitlabProjects.set(data.InstanceID, data);
        }
        this.showSpinner = false;
        this.setNextCursor(data.InstanceID, data.EndCursor);
      });


    }
  }

  getInstanceName(id: string): string {
    const y = this.gitLabServices.find(x => x.ID === id);
    if (y) {
      return y.Name;
    }
    return '';
  }

  setNextCursor(instance: string, cursor: string) {
    this.nextCursors.set(instance, cursor);
  }


  get scanOptions(): FormGroup {
    return this.projectForm.controls.scanOptions as FormGroup;
  }

  get scanPolicy(): FormGroup {
    return this.projectForm.controls.scanPolicy as FormGroup;
  }

  get newWorkspace(): boolean {
    return this.projectForm.get('newWorkspaceValue').value as string !== '';
  }

  convertToFormGroups(rs: AbstractControl[]): FormGroup[] {
    const out: FormGroup[] = [];
    rs.forEach(r => {
      out.push(r as FormGroup);
    });
    return out;
  }


  createScan() {
    const projDesc: ProjectDescription = {
      Name: this.projectForm.get('projectName').value as string,
      Workspace: this.newWorkspace ?
        this.projectForm.get('newWorkspaceValue').value as string :
        this.projectForm.get('workspace').value as string,
      Repositories: this.getRepos(),
      ScanPolicy: this.getScanPolicy(),
    };

    this.checkMateService.createProject(projDesc).subscribe(summary => {
      this.router.navigate(['project-detail', summary.ID]);
    });
  }

  getRepos(): Repository[] {
    const repos: Repository[] = [];
    this.selectedProjects.forEach(proj => {
      proj.Projects.forEach(p => {
        repos.push({
          LocationType: 'git',
          Location: p.Location,
          GitServiceID: p.ServiceID,
        });
      });
    });
    return repos;
  }

  getScanPolicy(): ScanPolicy {
    const options = new Map([
      ['secret-search-options', this.getScanOptions()]
    ]);
    const policy: ScanPolicy = {
      Config: options,
      Policy: '',
    };
    return policy;
  }

  getScanOptions(): SecretSearchOptions {
    return {
      ShowSource: this.scanOptions.get('showSource').value as boolean,
      CalculateChecksum: this.scanOptions.get('calculateChecksums').value as boolean,
      ConfidentialFilesOnly: this.scanOptions.get('confidentialFilesOnly').value as boolean,
      ExcludeTestFiles: this.scanOptions.get('excludeTestFiles').value as boolean,
      Verbose: false,
      ReportIgnored: false
    };
  }

}
