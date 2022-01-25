/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GitHubProject } from '../models/github-project';
import { FormProject } from '../models/project';
import { ProjectFormsService } from '../services/project-forms.service';

@Component({
  selector: 'app-github-project-listitem',
  templateUrl: './github-project-listitem.component.html',
  styleUrls: ['./github-project-listitem.component.scss']
})

export class GithubProjectListitemComponent implements OnInit {

  @Input() project: GitHubProject;
  @Input() fb: FormBuilder;
  showChildren = false;
  indeterminate = true;
  groupSelected = false;
  selectedProjects: boolean[] = [];
  form: FormGroup;

  constructor(private formService: ProjectFormsService) { }

  ngOnInit(): void {
    this.selectedProjects.push(false);
    this.form = this.fb.group({
      group: [this.project.ID],
      selectedProjects: this.fb.array([false]),
    }
    );
  }

  isGroup(): boolean {
    return false;
  }

  get groupedProjects() {
    return {
      ID: this.project.ID,
      Name: this.project.Name,
      Projects: [this.project],
    };
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

    const outProj: FormProject[] = [];
    for (let i = 0; i < this.selectedProjects.length; i++) {
      if (this.selectedProjects[i]) {
        const proj = this.groupedProjects.Projects[i];
        outProj.push({
          Location: proj.Url,
          ServiceID: proj.InstanceID,
          Monitor: true,//TODO
        });
      }
    }

    this.formService.updateProjectForm({
      GroupID: this.project.ID,
      Projects: outProj,
    });
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
}
