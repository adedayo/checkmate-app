/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { GitLabGroupedProjects } from '../models/gitlab-project';

@Component({
  selector: 'app-gitlab-project-listitem',
  templateUrl: './gitlab-project-listitem.component.html',
  styleUrls: ['./gitlab-project-listitem.component.scss']
})
export class GitlabProjectListitemComponent implements OnInit {



  @Input() groupedProjects: GitLabGroupedProjects;

  isList = true;
  showChildren = false;
  subList = 3;
  indeterminate = true;
  groupSelected = false;
  selectedProjects: boolean[] = [];
  form: FormGroup;


  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    for (const i of this.groupedProjects.Projects) {
      this.selectedProjects.push(false);
    }
    this.form = this.fb.group({
      group: [false],
      selectedProjects: this.fb.array([]),
    }
    );
  }

  get projects(): FormArray {
    return this.form.controls.selectedProjects as FormArray;
  }

  isGroup(): boolean {
    return this.groupedProjects.Name !== '';
  }

  selectProject(index: number) {

    this.selectedProjects[index] = !this.selectedProjects[index];
    this.updateState();
  }

  updateState() {
    let all = true;
    let some = false;
    this.selectedProjects.forEach(v => {
      all &&= v;
      some ||= v;
    });

    if (all) {
      this.indeterminate = false;
      this.groupSelected = true;
    } else if (some) {
      this.indeterminate = true;
      this.groupSelected = true;
    } else if (!all && !some) {
      this.groupSelected = false;
    }
  }

  get normaliseGroupedProjects(): GitLabGroupedProjects {

    if (this.isGroup()) {
      return this.groupedProjects;
    } else {
      const proj = this.groupedProjects.Projects[0];
      return {
        ID: proj.ID,
        Name: proj.Name,
        Projects: this.groupedProjects.Projects,
      };
    }
  }

  selectGroup() {
    this.groupSelected = !this.groupSelected;
    if (this.groupSelected) {
      for (let i = 0; i < this.selectedProjects.length; i++) {
        this.selectedProjects[i] = true;

      }
    } else {
      for (let i = 0; i < this.selectedProjects.length; i++) {
        this.selectedProjects[i] = false;

      }
    }
    this.updateState();
  }

  clickCheckBox(event: MouseEvent) {

    this.showChildren = !this.showChildren;
    // console.log(event);
    // const cbox = event.target as HTMLInputElement;
    // cbox.checked = true;
    // cbox.indeterminate = true;
    // console.log(cbox);



  }
}
