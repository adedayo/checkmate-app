import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { Project } from '../models/project';
import { ProjectSummary } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit, OnDestroy {

  faEdit = faEdit;

  spinForProject: boolean;
  spinForProjectSummary: boolean;
  project: Project;
  projectSummary: ProjectSummary;
  project$: Subscription;
  projectSummary$: Subscription;

  constructor(private fb: FormBuilder, private router: Router,
    private checkMateService: CheckMateService,) { }

  ngOnInit(): void {
    const path = this.router.url;
    if (path) {
      //get project ID from the route
      console.log(path);

      const subPaths = path.split('/');
      const projectID = subPaths[subPaths.length - 1];
      this.refreshProject(projectID);
    }
  }

  refreshProject(projectID: string) {
    this.spinForProject = true;
    this.spinForProjectSummary = true;
    this.project$ = this.checkMateService.getProject(projectID).subscribe(proj => {
      console.log(proj);

      this.setProject(proj);
      this.spinForProject = false;
    });
    this.projectSummary$ = this.checkMateService.getProjectSummary(projectID).subscribe(x => {
      console.log(x);

      this.setProjectSummary(x);
      this.spinForProjectSummary = false;
    });
  }

  setProject(proj: Project) {
    if (!proj || proj.ID === '') {
      return;
    }
    this.project = proj;
  }

  setProjectSummary(x: ProjectSummary) {
    this.projectSummary = x;
  }

  updateProject() {

  }

  ngOnDestroy(): void {
    if (this.project$) {
      this.project$.unsubscribe();
    }
    if (this.projectSummary$) {
      this.projectSummary$.unsubscribe();
    }
  }

}
