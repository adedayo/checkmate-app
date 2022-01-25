import { Component, OnInit } from '@angular/core';
import { ScanSummary, Workspace, WorkspaceDetail } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { curveBumpX } from 'd3-shape';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronIPC } from '../services/electron.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;

  showSpinner = true;
  noWorkspace = false;

  workspaceForm: FormGroup;
  wspace$: any;
  public set workspaceName(name: string) {
    this.currentWorkspaceName = name;
    if (this.workspaceForm.get('wspace').value as string !== name) {
      this.workspaceForm.patchValue({ wspace: name });
    }
    if (this.currentWorkspace) {
      this.setScanSummary(this.currentWorkspace.Summary);
      this.updateGraph();
    }

  }

  currentWorkspaceName = '';
  workspaces: Workspace;
  scanSummary: ScanSummary;
  workspaceNames: string[] = [];

  curve: any = curveBumpX;
  graphData = [];
  timelineView: any[] = [650, 275];
  issueCounts: any[] = this.graph(0, 0, 0, 0, 0);
  view: any[] = [270, 290];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  yAxisLabel = 'Issues';
  showYAxisLabel = true;
  xAxisLabel = 'Confidence';
  //see https://github.com/swimlane/ngx-charts/issues/498
  animations = true; //set this to false for bar charts error when any bar has value zero
  roundEdges = false; //or set this to false for bar charts error when any bar has value zero

  colorScheme0 = {
    domain: ['#178BCA', 'gold', 'purple', 'green', 'pink', 'brown', 'blue']
  };

  colorScheme = {
    domain: ['purple', 'red', 'gold', 'blue', 'green']
  };
  public get currentWorkspace(): WorkspaceDetail | null {
    if (!this.workspaces) {
      return null;
    }
    let name = 'Default';
    if (this.currentWorkspaceName !== 'Default') {
      name = this.currentWorkspaceName;
    }
    const ws = this.workspaces.Details[name];
    return ws;
  }

  constructor(private checkmate: CheckMateService, private ipc: ElectronIPC,
    private snackBar: MatSnackBar, private fb: FormBuilder) {

    this.workspaceForm = this.fb.group({
      wspace: [this.currentWorkspaceName],
    });

  }

  ngOnInit(): void {
    this.showSpinner = true;
    this.wspace$ = this.workspaceForm.get('wspace').valueChanges.subscribe(x => {
      this.workspaceName = x;
    });
    this.checkmate.getWorkspaceSummaries().subscribe(w => {
      if (w.Details) {
        this.noWorkspace = false;

        this.workspaces = w;
        this.workspaceNames = [];
        for (const k of Object.keys(w.Details)) {
          if (k === '' || k === 'Default') {
            this.workspaceNames.push('Default');
          } else {
            this.workspaceNames.push(k);
          }
        }
        if (this.workspaceNames.length > 0) {
          this.workspaceName = this.workspaceNames[0];
        } else {
          this.noWorkspace = true;
        }
      } else {
        this.noWorkspace = true;
      }
      this.showSpinner = false;
    });
  }


  trimDecimal(x: number): number {
    return Math.floor(x);
  }

  updateMetrics() {
    if (this.scanSummary && this.scanSummary.AdditionalInfo) {
      const summary = this.scanSummary;
      this.criticalCount = summary.AdditionalInfo.criticalCount;
      this.highCount = summary.AdditionalInfo.highCount;
      this.mediumCount = summary.AdditionalInfo.mediumCount;
      this.lowCount = summary.AdditionalInfo.lowCount;
      this.infoCount = summary.AdditionalInfo.informationalCount;
    }
  }

  setScanSummary(x: ScanSummary) {
    if (x) {
      this.scanSummary = x;
      if (x.AdditionalInfo) {
        const data = x.AdditionalInfo;
        this.issueCounts = this.graph(data.criticalCount, data.highCount, data.mediumCount, data.lowCount, data.informationalCount);
      }
    }
  }

  valueOrZero(x: string): string {
    return x ? x : '0';
  }

  updateGraph() {

    const ws = this.currentWorkspace;
    const result = [];
    if (ws) {
      if (ws.ProjectSummaries) {
        ws.ProjectSummaries.forEach(summary => {
          if (summary.LastScore && summary.LastScore.SubMetrics) {
            const data = [];
            for (const [k, v] of Object.entries(summary.LastScore.SubMetrics)) {
              const x = k.split(';');
              const tStamp = new Date(x[1]);
              data.push(
                {
                  name: tStamp,
                  value: v,
                  extra: {
                    scanID: x[0]
                  }
                });
            }
            result.push({
              name: summary.Name,
              series: [...data]
            });
          }
        });
        this.graphData = result;
      }
    }
  }




  graph(critical: number, high: number, med: number, low: number, info: number): any[] {
    return [
      {
        name: 'Critical',
        value: critical
      },
      {
        name: 'High',
        value: high
      },
      {
        name: 'Med',
        value: med
      },
      {
        name: 'Low',
        value: low
      },
      {
        name: 'Info',
        value: info
      }
    ];
  }

  downloadProjectsReport() {
    this.showSpinner = true;
    this.checkmate.downloadProjectScores(this.currentWorkspaceName).subscribe(x => {
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
