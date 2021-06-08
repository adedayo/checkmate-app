import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faCog, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { ProjectSummary, ProjectScanOptions, ScanEnd, ScanProgress, ScanResult, SecurityDiagnostic } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { curveBumpX } from 'd3-shape';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit, OnDestroy {

  @Input() projectSummary: ProjectSummary;
  faCog = faCog;
  faPlayCircle = faPlayCircle;
  currentFile = '';
  progress = 0;
  highCount = 0;
  mediumCount = 0;
  lowCount = 0;
  infoCount = 0;

  scanning = false;

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
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  runScan$: Subscription;


  constructor(private checkMateService: CheckMateService, private router: Router) { }


  ngOnInit(): void {
    this.updateGraph();
  }

  ngOnDestroy(): void {
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
      msg => {

        if (this.isScanProgress(msg)) {
          // console.log('Got progress: ', JSON.stringify(msg));
          const prog = msg as ScanProgress;
          this.currentFile = prog.CurrentFile;
          if (prog.Total > 0) {
            this.progress = (100 * prog.Position) / prog.Total;
          }
        } else if (this.isScanEnd(msg)) {
          // console.log('Ending scan');
          this.currentFile = '';
          this.scanning = false;
          this.checkMateService.getProjectSummary(this.projectSummary.ID).subscribe(summary => {
            this.projectSummary = summary;
            this.updateGraph();
          });

        }
        else if (this.isDiagnostic(msg)) {
          const diag = msg as SecurityDiagnostic;
          switch (diag.justification.headline.confidence.toLowerCase()) {
            case 'high':
              this.highCount += 1;
              break;
            case 'medium':
              this.mediumCount += 1;
              break;
            case 'low':
              this.lowCount += 1;
              break;
            case 'informational':
              this.infoCount += 1;
              break;
            default:
              break;
          }

        }
      },
      err => {
        console.log('Error', err);
      },
      () => {
        console.log('Socket closed');
      }
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
      this.highCount = summary.AdditionalInfo.highcount;
      this.mediumCount = summary.AdditionalInfo.mediumcount;
      this.lowCount = summary.AdditionalInfo.lowcount;
      this.infoCount = summary.AdditionalInfo.informationalcount;
    }
  }

  isScanProgress(msg: ScanResult | ScanProgress | SecurityDiagnostic | ScanEnd | ProjectScanOptions): boolean {
    return (msg as ScanProgress).Position !== undefined;
  }

  isScanEnd(msg: ScanResult | ScanProgress | SecurityDiagnostic | ScanEnd | ProjectScanOptions): boolean {
    return (msg as ScanEnd).Message !== undefined;
  }

  isDiagnostic(msg: ScanResult | ScanProgress | SecurityDiagnostic | ScanEnd | ProjectScanOptions): boolean {
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
    console.log('called load project');
    this.router.navigate(['project-detail']);
  }
}
