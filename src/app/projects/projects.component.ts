import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ProjectSummary } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  projectSummaries$: Observable<ProjectSummary[]>;
  projNameSearch = '';
  faSearch = faSearch;
  showSpinner = true;
  constructor(private checkmateService: CheckMateService) {
    this.projectSummaries$ = this.checkmateService.getProjectSummaries();
  }


  ngOnInit(): void {
    this.checkmateService.setSpinnerState(true);
    this.checkmateService.spinnerState.subscribe(spin => {
      setTimeout(() => this.showSpinner = spin, 0);
    });
  }
}
