import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { CheckMateService } from '../services/checkmate.service';

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


  constructor(private fb: FormBuilder, private checkMateService: CheckMateService,) { }

  ngOnInit(): void {

    this.checkMateService.getDefaultPolicy().subscribe(pol => {
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
  }

  public get newWorkspace(): boolean {
    return this.projectForm.get('newWorkspace').value as boolean;
  }

}
