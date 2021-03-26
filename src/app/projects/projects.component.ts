import { Component, OnInit } from '@angular/core';
import { ProjectSummary } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  projectSummaries: ProjectSummary[] = []
  // summary: ProjectSummary = {
  //   id: 'id',
  //   name: 'My Project Name',
  //   lastScore: {
  //     grade: 'F',
  //     metric: 3,
  //   },

  // }
  constructor(private checkmateService: CheckMateService) { }

  ngOnInit(): void {
    this.checkmateService.getProjectSummaries().subscribe(s => {
      console.log("Got summaries ", JSON.stringify(s));
      this.projectSummaries = s
    })
  }

}
