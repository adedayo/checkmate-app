import { Component, Input, OnInit } from '@angular/core';
import { faCog, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { ProjectSummary } from '../models/project-scan';

@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {

  faCog = faCog
  faPlayCircle = faPlayCircle

  @Input() projectSummary: ProjectSummary
  constructor() { }

  ngOnInit(): void {
  }

}
