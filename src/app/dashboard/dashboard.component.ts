/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScanProgress, ScanStatus, ScanSummary, Workspace, WorkspaceDetail } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { curveBumpX } from 'd3-shape';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronIPC } from '../services/electron.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { NgxIsElectronService } from 'ngx-is-electron';
import { faL } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;

  showSpinner = true;
  noWorkspace = false;
  isInElectron = false;

  workspaceForm: FormGroup;
  subscriptions: Subscription;
  scanInProgress: boolean;

  public set workspaceName(name: string) {
    this.currentWorkspaceName = name;
    this.scanInProgress = false;
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
  sockets: WebSocketSubject<ScanStatus>[] = [];
  projectIDs = new Map<string, string[]>();//map from workspace -> project IDs

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
    electronService: NgxIsElectronService,
    private snackBar: MatSnackBar, private fb: FormBuilder) {
    this.showSpinner = true;
    this.isInElectron = electronService.isElectronApp;
    this.workspaceForm = this.fb.group({
      wspace: [this.currentWorkspaceName],
    });

  }

  ngOnDestroy(): void {
    this.sockets.forEach(socket => {
      socket.complete();
    });
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.subscriptions = this.workspaceForm.get('wspace').valueChanges.subscribe(x => {
      this.workspaceName = x;
    });
    this.subscriptions.add(this.checkmate.getWorkspaceSummaries().subscribe({
      next: w => {
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
          this.workspaceNames = this.workspaceNames.filter(this.uniqueFilter);
          if (this.workspaceNames.length > 0) {
            this.workspaceName = this.workspaceNames[0];
            this.workspaceNames.forEach(ws => {
              const projectIDs: string[] = [];
              this.workspaces.Details[ws].ProjectSummaries.forEach(ps => {
                projectIDs.push(ps.ID);
              });
              this.projectIDs.set(ws, projectIDs);
              const socket = this.checkmate.monitorProjectScan({ ProjectIDs: projectIDs });
              this.sockets.push(socket);
              this.subscriptions.add(socket.subscribe(x => {
                if (this.isScanProgress(x) && x.Position !== x.Total) {
                  if (this.projectIDs.get(this.currentWorkspaceName).includes(x.ProjectID)) {
                    this.scanInProgress = true;
                  } else {
                    this.scanInProgress = false;
                  }
                } else {
                  this.scanInProgress = false;
                }
              }, _ => {
                //silence close error

              }));
            });
          } else {
            this.noWorkspace = true;
          }
        } else {
          this.noWorkspace = true;
        }
        this.showSpinner = false;
      },
      error: _err => {
        console.log('Workspace error', _err);
        this.showSpinner = false;
      },
    }));
  }


  uniqueFilter(value: string, index: number, self: string[]): boolean {
    return self.indexOf(value) === index;
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
    if (this.isInElectron) {
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
    } else {
      this.checkmate.downloadWorkspaceCSVReport(this.currentWorkspaceName).subscribe(x => {
        saveAs(x, `${this.currentWorkspaceName}_Workspace_Report.csv`);

      });
    }
  }

  isScanProgress(msg: ScanStatus): msg is ScanProgress {
    return (msg as ScanProgress).Position !== undefined;
  }

}
