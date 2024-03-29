/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxIsElectronService } from 'ngx-is-electron';
import { ProjectDescription, Repository, ScanPolicy, SecretSearchOptions } from '../models/project-scan';
import { RepoType } from '../models/project';
import { CheckMateService } from '../services/checkmate.service';
import { ElectronIPC } from '../services/electron.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-project-setup',
  templateUrl: './project-setup.component.html',
  styleUrls: ['./project-setup.component.scss']
})
export class ProjectSetupComponent implements OnInit, OnDestroy {


  projectForm: FormGroup;
  isInElectron = false;

  repoTypes: RepoType[] = [
    { type: 'git', value: 'git' },
    { type: 'filesystem', value: 'filesystem' },
  ];
  selectedType = 'git';

  existingWorkspaces: string[] = ['Default'];
  subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder,
    electronService: NgxIsElectronService,
    private ipc: ElectronIPC,
    private checkMateService: CheckMateService,
    private router: Router) {
    this.isInElectron = electronService.isElectronApp;
  }


  public get newWorkspace(): boolean {
    return this.projectForm.get('newWorkspace').value as boolean;
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  ngOnInit(): void {

    this.subscriptions.add(this.checkMateService.getDefaultPolicy().subscribe(pol => {
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
        scanPolicy: this.fb.group({
          configured: [false],
          policy: [pol],
        }),
      });

      this.subscriptions = this.checkMateService.getWorkspaceSummaries().subscribe(w => {
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
    }));

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
      scanPolicy: this.fb.group({
        configured: [false],
        policy: [''],
      }),
    });


  }

  get repositories(): FormArray {
    return this.projectForm.controls.repositories as FormArray;
  }

  get scanOptions(): FormGroup {
    return this.projectForm.controls.scanOptions as FormGroup;
  }

  get scanPolicy(): FormGroup {
    return this.projectForm.controls.scanPolicy as FormGroup;
  }

  addRepo() {
    const repo = this.fb.group({
      type: ['git', Validators.required],
      coordinate: ['']
    });
    this.repositories.push(repo);
  }

  deleteRepo(index: number) {
    this.repositories.removeAt(index);
  }

  convertToFormGroups(rs: AbstractControl[]): FormGroup[] {
    const out: FormGroup[] = [];
    rs.forEach(r => {
      out.push(r as FormGroup);
    });
    return out;
  }

  getCodePath(index: number) {
    this.ipc.getCodePath().then(
      path => {
        let codebase = '';
        if (path.length > 0) {
          codebase = path[0];
        }
        this.repositories.at(index).patchValue({
          coordinate: codebase,
        });
      }
    );
  }

  createProject() {
    const projDesc: ProjectDescription = {
      Name: this.projectForm.get('projectName').value as string,
      Workspace: this.newWorkspace ?
        this.projectForm.get('newWorkspaceValue').value as string :
        this.projectForm.get('workspace').value as string,
      Repositories: this.getRepos(),
      ScanPolicy: this.getScanPolicy(),
    };

    // console.log(projDesc);

    this.checkMateService.createProject(projDesc).subscribe(summary => {
      this.router.navigate(['project-detail', summary.ID], { queryParams: { scan: 'y' } });
    });
  }


  getRepos(): Repository[] {
    const repos: Repository[] = [];
    this.repositories.controls.forEach(control => {
      const t = control.get('type').value as string;
      const repo: Repository = {
        Location: control.get('coordinate').value as string,
        LocationType: t,
        Monitor: t === 'git',
      };
      repos.push(repo);
    });
    return repos;
  }


  getScanPolicy(): ScanPolicy {
    const options = new Map([
      ['secret-search-options', this.getScanOptions()]
    ]);
    const policy: ScanPolicy = {
      Config: options,
      // Policy: this.getExcludePolicy(),
      PolicyString: this.getExcludePolicy(),
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

  getExcludePolicy(): string {
    if (this.scanPolicy.get('configured').value as boolean) {
      return this.scanPolicy.get('policy').value as string;
    }
    return '';
  }

}
