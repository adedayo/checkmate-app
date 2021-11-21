/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { GitLabProject } from '../models/gitlab-project';
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
  showSpinner = false;
  gitlabProjects: GitLabProject[];
  selectedProjects: Map<string, ProjectSubForm>;

  constructor(private fb: FormBuilder,
    private checkMateService: CheckMateService,
    private formService: ProjectFormsService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.showSpinner = true;

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

    this.checkMateService.gitLabDiscover().subscribe(data => {
      this.gitlabProjects = data;
      this.showSpinner = false;
    }
    );
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

    console.log(projDesc);
    // this.checkMateService.createProject(projDesc).subscribe(summary => {
    //   this.router.navigate(['project-detail', summary.ID]);
    // });
  }

  getRepos(): Repository[] {
    const repos: Repository[] = [];
    this.selectedProjects.forEach(proj => {
      proj.Projects.forEach(p => {
        repos.push({
          LocationType: 'git',
          Location: p,
          GitServiceID: '',
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
