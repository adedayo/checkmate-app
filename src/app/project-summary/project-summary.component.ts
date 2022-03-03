/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { faCog, faEdit, faPlayCircle, faShieldAlt, faSlidersH, faWrench } from '@fortawesome/free-solid-svg-icons';
import {
  ProjectSummary, ProjectScanOptions, ScanEnd, ScanProgress,
  SecurityDiagnostic, ScanStatus
} from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { curveBumpX } from 'd3-shape';
import { Subscription } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit, OnDestroy {

  @Output() finishedLoading = new EventEmitter<boolean>();
  @Input() projectSummary: ProjectSummary;
  faSettings = faEdit;
  faPlayCircle = faPlayCircle;
  faShield = faShieldAlt;
  appName = 'CheckMate';
  currentFile = '';
  progress = 0;
  criticalCount = 0;
  highCount = 0;
  mediumCount = 0;
  lowCount = 0;
  infoCount = 0;

  scanning = false;
  sockets: WebSocketSubject<ScanStatus>[] = [];

  graphData = [];
  // view: any[] = [350, 120];

  // options
  legend = false;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = false;
  showXAxisLabel = false;
  xAxisLabel = 'Time';
  yAxisLabel = 'Grade';
  timeline = false;
  autoScale = true;

  curve: any = curveBumpX;
  colorScheme = {
    domain: ['#33bbff', '#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  runScan$: Subscription;


  constructor(private checkMateService: CheckMateService, private router: Router) { }


  ngOnInit(): void {
    this.checkMateService.setSpinnerState(false);//stop spinning the wheel in the project list view
    this.updateGraph();

    const socket = this.checkMateService.monitorProjectScan({ ProjectIDs: [this.projectSummary.ID] });
    this.sockets.push(socket);
    socket.subscribe(msg => {
      if (this.isScanProgress(msg)) {
        const prog = msg;
        this.currentFile = prog.CurrentFile;
        if (prog.Total > 0) {
          this.progress = (100 * prog.Position) / prog.Total;
        }
        if (msg.Position === msg.Total) {
          this.currentFile = '';
          this.scanning = false;
          this.progress = 0;
        }
      }
    },
      err => {

        if ((err as CloseEvent).type !== undefined) {
          if ((err as CloseEvent).type === 'close') {
            return;
          }
        }
        console.error('Error:', err);
      },
      () => { });
  }

  ngOnDestroy(): void {
    this.sockets.forEach(socket => {
      socket.complete();
    });
    if (this.runScan$) {
      this.runScan$.unsubscribe();
    }
  }

  displayType(t: string): string {
    if (t === 'filesystem') {
      return 'fs';
    }
    return t;
  }

  runScan() {
    this.scanning = true;
    this.resetCounts();
    const options: ProjectScanOptions = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ProjectID: this.projectSummary.ID,
    };

    if (this.runScan$) {
      this.runScan$.unsubscribe();
    }

    this.runScan$ = this.checkMateService.runScan(options).subscribe(
      // msg => {

      //   if (this.isScanProgress(msg)) {
      //     // console.log('Got progress: ', JSON.stringify(msg));
      //     const prog = msg as ScanProgress;
      //     this.currentFile = prog.CurrentFile;
      //     if (prog.Total > 0) {
      //       this.progress = (100 * prog.Position) / prog.Total;
      //     }
      //   } else if (this.isScanEnd(msg)) {
      //     // console.log('Ending scan');
      //     this.currentFile = '';
      //     this.scanning = false;
      //     this.checkMateService.getProjectSummary(this.projectSummary.ID).subscribe(summary => {
      //       this.projectSummary = summary;
      //       this.updateGraph();
      //     });
      //   }
      //   else if (this.isDiagnostic(msg)) {
      //     const diag = msg as SecurityDiagnostic;
      //     switch (diag.justification.headline.confidence.toLowerCase()) {
      //       case 'high':
      //         this.highCount += 1;
      //         break;
      //       case 'medium':
      //         this.mediumCount += 1;
      //         break;
      //       case 'low':
      //         this.lowCount += 1;
      //         break;
      //       case 'informational':
      //         this.infoCount += 1;
      //         break;
      //       default:
      //         break;
      //     }
      //   }
      // },
      // err => {
      //   if ((err as CloseEvent).type !== undefined) {
      //     if ((err as CloseEvent).type === 'close') {
      //       return;
      //     }
      //   }
      //   console.error('Error:', err);
      // },
      // () => {
      //   // console.log('Socket closed');
      // }
    );
  }

  updateGraph() {
    if (this.projectSummary.LastScore && this.projectSummary.LastScore.SubMetrics) {
      const data = [];
      {
        for (const [k, v] of Object.entries(this.projectSummary.LastScore.SubMetrics)) {

          data.push(
            {
              name: new Date(k.split(';')[1]),
              value: v
            });
        }
        const result = [
          {
            name: 'Score',
            series: [...data]
          }];
        this.graphData = result;
      }
    }
    this.updateMetrics();
  }

  updateMetrics() {
    if (this.projectSummary.LastScanSummary && this.projectSummary.LastScanSummary.AdditionalInfo) {
      const summary = this.projectSummary.LastScanSummary;
      this.criticalCount = summary.AdditionalInfo.criticalCount;
      this.highCount = summary.AdditionalInfo.highCount;
      this.mediumCount = summary.AdditionalInfo.mediumCount;
      this.lowCount = summary.AdditionalInfo.lowCount;
      this.infoCount = summary.AdditionalInfo.informationalCount;
    }
  }

  isScanProgress(msg: ScanStatus): msg is ScanProgress {
    return (msg as ScanProgress).Position !== undefined;
  }

  isScanEnd(msg: ScanStatus): msg is ScanEnd {
    return (msg as ScanEnd).Message !== undefined;
  }

  isDiagnostic(msg: ScanStatus): boolean {
    return (msg as SecurityDiagnostic).justification !== undefined;
  }

  resetCounts() {
    this.progress = 0;
    this.highCount = 0;
    this.mediumCount = 0;
    this.lowCount = 0;
    this.infoCount = 0;
  }

  loadProject() {
    this.router.navigate(['project-detail', this.projectSummary.ID]);
  }

  editProject() {
    this.router.navigate(['project-edit', this.projectSummary.ID]);
  }
}
