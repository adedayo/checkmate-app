import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ProjectSummary } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  projectSummaries$: Observable<ProjectSummary[]>;
  // projectSummaries: ProjectSummary[] = [];

  constructor(private checkmateService: CheckMateService) { }

  ngOnInit(): void {
    this.projectSummaries$ = this.checkmateService.getProjectSummaries();
  }

}
