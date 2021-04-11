import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { ElectronIPC } from '../services/electron.service';


@Component({
  selector: 'app-project-setup',
  templateUrl: './project-setup.component.html',
  styleUrls: ['./project-setup.component.scss']
})
export class ProjectSetupComponent implements OnInit {


  projectForm: FormGroup;
  isInElectron = false;

  repoTypes: RepoType[] = [
    { type: 'git', value: 'git' },
    { type: 'filesystem', value: 'fs' },
  ];
  selectedType = 'git';






  constructor(private fb: FormBuilder, private electronService: ElectronService, private ipc: ElectronIPC) {
    this.isInElectron = electronService.isElectronApp;
  }


  ngOnInit(): void {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
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

}

interface RepoType {
  type: string;
  value: string;
}

