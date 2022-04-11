import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ProjectSummary } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronIPC } from '../services/electron.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  projectSummaries$: Observable<ProjectSummary[]>;
  projNameSearch = '';
  faSearch = faSearch;
  showSpinner = true;
  subscriptions: Subscription;

  constructor(private checkmateService: CheckMateService, private ipc: ElectronIPC,
    private snackBar: MatSnackBar) {

  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe()
    }
  }


  ngOnInit(): void {
    this.checkmateService.setSpinnerState(true);

    this.subscriptions = this.checkmateService.spinnerState.subscribe(spin => {
      setTimeout(() => this.showSpinner = spin, 0);
    });
    this.projectSummaries$ = this.checkmateService.getProjectSummaries();
    this.subscriptions.add(this.projectSummaries$.subscribe({
      next: _x => {
        this.checkmateService.setSpinnerState(false);
      },
      error: _err => {
        this.checkmateService.setSpinnerState(false);
      }
    }));
  }

  downloadProjectsReport() {

    this.showSpinner = true;
    this.checkmateService.downloadProjectScores('__cm_all').subscribe(x => {
      this.showSpinner = false;
      this.ipc.saveScanreport(x).then(val => {
        if (val === '') {
          this.snackBar.open(`Cancelled`, 'close');
        } else {
          this.snackBar.open(`Saved report at ${val}`, 'close');
        }
        setTimeout(() => this.snackBar.dismiss(), 5000);
      });
    },
      err => {
        this.showSpinner = false;
        this.snackBar.open('Error generating project summary report ' + err.error, 'close');
      }
    );
  }

}
