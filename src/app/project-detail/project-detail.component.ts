/* eslint-disable @typescript-eslint/naming-convention */
import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeContext, ExcludeRequirement, IssueFilter, PagedResult, PaginatedSearch, Project } from '../models/project';
import {
  ProjectScanOptions, ProjectSummary, ScanEnd, ScanProgress,
  ScanSummary, SecurityDiagnostic, ScanStatus
} from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { curveBumpX } from 'd3-shape';
import { Subscription } from 'rxjs';
import { faCog, faPlayCircle, faSave, faFileDownload, faSearch, faE } from '@fortawesome/free-solid-svg-icons';
import { ElectronIPC } from '../services/electron.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxIsElectronService } from 'ngx-is-electron';
import { WebSocketSubject } from 'rxjs/webSocket';
import { saveAs } from 'file-saver';
import { faEdit } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  projectID = '';
  project: Project;
  faEdit = faEdit;
  projectSummary: ProjectSummary;
  scanSummary: ScanSummary;
  selectedFix = 'ignore_here';
  currentIssue: SecurityDiagnostic;
  currentScanID: string;
  reselect = false;

  spinGeneral = false;
  spinForProject = false;
  spinForProjectSummary = false;
  sockets: WebSocketSubject<ScanStatus>[] = [];
  public set showSpinner(v: boolean) {
    this.spinGeneral = v;
  }



  public get showSpinner(): boolean {
    return this.spinGeneral || this.spinForProject || this.spinForProjectSummary;
  }


  expandReusedSecretsPanel = false;
  expandRescanPanel = true;
  faCog = faCog;
  faFileDownload = faFileDownload;
  faSave = faSave;
  faPlayCircle = faPlayCircle;
  issueSearch = '';
  faSearch = faSearch;
  currentFile = '';
  progress = 0;

  filterForm: FormGroup;
  filter: IssueFilter = {
    Confidence: [],
    Tags: ['test', 'prod'],
    ConfidentialFilesOnly: false,
  };

  code = '';
  firstLineNumber = 1;
  policy = '';
  issueFocussed = false;
  pagingForm: FormGroup;
  showPolicy = false;
  fixForm: FormGroup;
  pagedResult: PagedResult;
  pageSizeValue = 10;
  defaultPageSizes = [10, 20, 50, 100, 500, 1000, 2000];
  fixes: FixTypes[] = [
    {
      fix: 'ignore_here',
      description: 'Ignore this issue in this file (i)'
    },
    {
      fix: 'ignore_sha2_here',
      description: 'Ignore checksum in this file (a)'
    },
    {
      fix: 'ignore_everywhere',
      description: 'Ignore this issue everywhere (e)'
    },
    {
      fix: 'ignore_sha2_everywhere',
      description: 'Ignore checksum everywhere (s)'
    },
    {
      fix: 'ignore_file',
      description: 'Ignore this file (f)'
    },
  ];



  curve: any = curveBumpX;
  graphData = [];
  timelineView: any[] = [650, 300];
  issueCounts: any[] = this.graph(0, 0, 0, 0, 0);
  view: any[] = [250, 290];

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
    domain: ['#178BCA', 'gold', 'purple', 'green']
  };

  colorScheme = {
    domain: ['purple', 'red', 'gold', 'blue', 'green']
  };
  project$: Subscription;
  projectSummary$: Subscription;
  size$: Subscription;
  fix$: Subscription;
  advancedFix$: Subscription;
  filterForm$: Subscription;
  scanning: boolean;
  runScan$: any;

  isInElectron = false;
  debug = false;

  constructor(private fb: FormBuilder, private router: Router,
    private activatedRoute: ActivatedRoute,
    private checkMateService: CheckMateService,
    electronService: NgxIsElectronService, private ipc: ElectronIPC,
    private snackBar: MatSnackBar) {

    this.isInElectron = electronService.isElectronApp;
    this.pagingForm = this.fb.group({
      size: [this.pageSizeValue],
    });

    this.fixForm = this.fb.group({
      fix: [this.selectedFix],
      advancedFix: [false],
    });

    this.filterForm = this.fb.group({
      critical: [false],
      high: [false],
      med: [false],
      low: [false],
      info: [false],
      prod: [true],
      test: [true],
      conf: [false],
      unique: [false],
    });

  }



  ngOnInit() {
    const path = this.router.url;
    if (path) {
      //get project ID from the route
      const subPaths = path.split('/');
      const projectID = subPaths[subPaths.length - 1].split('?')[0];
      this.projectID = projectID;

      // this.activatedRoute.queryParamMap.subscribe(p => {
      //   if (p.has('scan')) {
      //     this.runScan();
      //   }
      // });

      this.refreshProject(projectID);

      const socket = this.checkMateService.monitorProjectScan({ ProjectIDs: [projectID] });
      this.sockets.push(socket);
      socket.subscribe(msg => {
        this.showSpinner = false;
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
            // this.refreshProject(this.projectSummary.ID);
          }
        } else if (this.isProjectSummary(msg)) {
          this.setProjectSummary(msg);
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

    this.size$ = this.pagingForm.get('size').valueChanges.subscribe(x => {
      this.pageSizeValue = x;
      let currentPage = 0;
      if (this.pagedResult) {
        currentPage = this.pagedResult.Page;
      }
      this.paginateIssues(currentPage);
    });

    this.fix$ = this.fixForm.get('fix').valueChanges.subscribe(x => {
      this.selectedFix = x;
    });

    this.advancedFix$ = this.fixForm.get('advancedFix').valueChanges.subscribe(x => {
      this.showPolicy = x;
    });

    this.filterForm$ = this.filterForm.valueChanges.subscribe(x => {
      this.filter.Confidence = [];
      if (x.critical) {
        this.filter.Confidence.push('Critical');
      }
      this.filter.Tags = [];
      if (x.high) {
        this.filter.Confidence.push('High');
      }
      if (x.med) {
        this.filter.Confidence.push('Med');
      }
      if (x.low) {
        this.filter.Confidence.push('Low');
      }
      if (x.info) {
        this.filter.Confidence.push('Info');
      }
      if (x.test) {
        this.filter.Tags.push('test');
      }
      if (x.prod) {
        this.filter.Tags.push('prod');
      }
      if (x.conf) {
        this.filter.Tags.push('confidential');
      }
      if (x.unique) {
        this.filter.Tags.push('unique');
      }
      this.paginateIssues(0);
    });



  }

  editProject() {
    this.router.navigate(['project-edit', this.projectSummary.ID]);
  }

  refreshProject(projectID: string) {
    // this.spinForProject = true;
    this.spinForProjectSummary = true;
    // this.project$ = this.checkMateService.getProject(projectID).subscribe(proj => {
    //   console.log('Got project ', proj);

    //   this.setProject(proj);
    //   this.spinForProject = false;
    // });
    this.projectSummary$ = this.checkMateService.getProjectSummary(projectID).subscribe(x => {
      this.setProjectSummary(x);
      this.spinForProjectSummary = false;
    });
  }

  ngOnDestroy(): void {
    this.sockets.forEach(socket => {
      socket.complete();
    });
    if (this.project$) {
      this.project$.unsubscribe();
    }
    if (this.projectSummary$) {
      this.projectSummary$.unsubscribe();
    }
    if (this.size$) {
      this.size$.unsubscribe();
    }
    if (this.fix$) {
      this.fix$.unsubscribe();
    }
    if (this.advancedFix$) {
      this.advancedFix$.unsubscribe();
    }
    if (this.filterForm$) {
      this.filterForm$.unsubscribe();
    }
  }

  updateGraph() {
    if (this.projectSummary.ScoreTrend) {
      const data = [];
      {
        for (const [k, v] of Object.entries(this.projectSummary.ScoreTrend)) {
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
        const result = [
          {
            name: 'Score',
            series: [...data]
          }];

        this.graphData = result;
      }
    }
  }


  setProjectSummary(x: ProjectSummary) {
    this.projectSummary = x;
    this.setScanID(x.LastScanID);
    if (x.ScanPolicy && x.ScanPolicy.PolicyString) {
      this.policy = x.ScanPolicy.PolicyString;
    }
    this.setScanSummary(x.LastScanSummary);
  }

  setScanSummary(x: ScanSummary) {
    if (x) {
      this.scanSummary = x;
      if (x.AdditionalInfo) {
        const data = x.AdditionalInfo;
        this.issueCounts = this.graph(data.criticalCount, data.highCount, data.mediumCount, data.lowCount, data.informationalCount);
      }
      this.updateGraph();
    }
  }

  get pageSize(): FormControl {
    return this.pagingForm.get('size') as FormControl;
  }

  setProjectPolicy(proj: Project) {
    if (!proj || proj.ID === '') {
      return;
    }
    if (proj.ScanPolicy && proj.ScanPolicy.PolicyString) {
      this.policy = proj.ScanPolicy.PolicyString;
    }


  }

  setScanID(id: string) {
    this.currentScanID = id;
    this.paginateIssues(0);
  }

  paginateIssues(page: number) {
    if (!this.projectSummary) {
      return;
    }
    this.showSpinner = true;
    const search: PaginatedSearch = {
      ProjectID: this.projectSummary.ID,
      ScanID: this.currentScanID,
      PageSize: this.pageSizeValue,
      Page: page,
      Filter: this.filter
    };

    this.checkMateService.getIssues(search).subscribe(result => {
      this.pagedResult = result;
      this.reselect = true;
      this.showSpinner = false;
    });
  }

  savePolicy() {
    this.checkMateService.updateProject(this.projectSummary.ID, {
      Name: this.projectSummary.Name,
      Workspace: this.projectSummary.Workspace,
      Repositories: this.projectSummary.Repositories,
      ScanPolicy: {
        ID: this.projectSummary.ScanPolicy.ID,
        Config: this.projectSummary.ScanPolicy.Config,
        Policy: JSON.stringify(this.projectSummary.ScanPolicy.Policy),
        PolicyString: this.policy
      }
    }).subscribe(proj => {
      this.setProjectPolicy(proj);
    });
  }

  selectNextPageStart() {
    // console.log('next page', this.incidents);
    // if (this.incidents) {
    //   const elements = this.incidents.nativeElement.querySelectorAll<HTMLElement>('[ng-reflect-arrow-index]');
    //   // console.log('Elements', elements);
    //   if (!!elements) {
    //     const sorted = Array.from(elements).sort((a, b) => this.getTabIndex(a) - this.getTabIndex(b));
    //     console.log('sorted', sorted[0], sorted.pop());
    //     // this.incidents.nativeElement.focus();
    //     sorted[0].focus();
    //   }

    // }

    // console.log('about to focus on ', this.elements[0]);
    // const tab = new KeyboardEvent('keydown', {
    //   bubbles: true,
    //   key: 'Tab',
    //   code: 'Tab',
    // });
    // // this.incidents.nativeElement.dispatchEvent(tab);
    // this.elements[0].focus();
    // this.elements[0].focus();
    // this.elements[0].focus();
    // this.reselect = false;
  }

  getTabIndex(e: Element): number {
    return Number.parseInt(e.getAttribute('ng-reflect-arrow-index') || '', 10);
  }



  focussed(issue: SecurityDiagnostic) {
    if (issue) {
      this.focusIn();
      this.currentIssue = issue;
      this.code = issue.source;
      this.firstLineNumber = issue.range.start.line + 1;
    }
  }

  pageListener(event: string) {
    this.issueFocussed = false;
    if (event === 'KeyI') {
      this.selectedFix = this.fixes[0].fix;
      this.fixIssue();
    } else if (event === 'KeyA') {
      this.selectedFix = this.fixes[1].fix;
      this.fixIssue();
    } else if (event === 'KeyE') {
      this.selectedFix = this.fixes[2].fix;
      this.fixIssue();
    } else if (event === 'KeyS') {
      this.selectedFix = this.fixes[3].fix;
      this.fixIssue();
    } else if (event === 'KeyF') {
      this.selectedFix = this.fixes[4].fix;
      this.fixIssue();
    } else if (event === 'KeyC') {
      this.loadFullCode();
      this.issueFocussed = true;
    } else if (event === 'top') {
      if (this.pagedResult) {
        if (this.pagedResult.Page > 0) {
          this.paginateIssues(this.pagedResult.Page - 1);
        }
      }
    } else {
      if (this.pagedResult) {
        if (this.pagedResult.Page * (this.pagingForm.get('size').value as number) < this.pagedResult.Total) {
          this.paginateIssues(this.pagedResult.Page + 1);
        }
      }
    }
  }

  downloadCSVReport() {
    this.showSpinner = true;
    if (this.isInElectron) {
      this.checkMateService.getCSVReportPath(this.projectSummary.ID, this.currentScanID, this.filter).subscribe(x => {
        this.showSpinner = false;
        this.ipc.saveScanreport(x).then(val => {
          this.snackBar.open(`Saved report at ${val}`, 'close');
          setTimeout(() => this.snackBar.dismiss(), 5000);
        });
      },
        err => {
          this.showSpinner = false;
          this.snackBar.open('Error generating CSV report ' + err.error, 'close');
        }
      );
    } else {
      this.checkMateService.downloadCSVReport(this.projectSummary.ID, this.currentScanID, this.filter).subscribe(x => {
        this.showSpinner = false;
        saveAs(x, `${this.projectSummary.Name}_Scan_${this.currentScanID}.csv`);
      },
        err => {
          this.showSpinner = false;
          const message = err.message as string;
          this.snackBar.open(message, 'close');
        });
    }
  }

  downloadReport() {
    this.showSpinner = true;
    if (this.isInElectron) {
      this.checkMateService.getPDFReportPath(this.projectSummary.ID, this.currentScanID).subscribe(x => {
        this.showSpinner = false;

        this.ipc.saveScanreport(x).then(val => {
          this.snackBar.open(`Saved report at ${val}`, 'close');
          setTimeout(() => this.snackBar.dismiss(), 5000);
        });


      },
        err => {
          this.showSpinner = false;
          const message = err.error as string;
          // console.log(message);

          if (message.includes('asciidoctor')) {
            this.snackBar.open('Install asciidoctor-pdf to get PDF reports and ensure that it is in your PATH environment variable.' +
              ' Installation detail may be found at https://github.com/asciidoctor/asciidoctor-pdf/#getting-started' +
              '\n' + message, 'close');
          }
        }
      );
    } else {
      this.checkMateService.downloadPDFReport(this.projectSummary.ID, this.currentScanID).subscribe(x => {
        this.showSpinner = false;
        saveAs(x, `${this.projectSummary.Name}_Scan_${this.currentScanID}.pdf`);
      },
        err => {
          this.showSpinner = false;
          const message = err.message as string;
          this.snackBar.open(message, 'close');
        });
    }
  }

  downloadPolicy() {
    const path = `${this.projectSummary.Name.toLowerCase().replace(' ', '-')}_allow-list.yaml`;
    const policy = this.projectSummary.ScanPolicy.PolicyString;
    if (this.isInElectron) {
      this.ipc.savePolicy(path, policy).then(_val => {
        // console.log('Saved Policy as ', _val);
      });
    } else {
      // console.log('about to save policy');
      const blob = new Blob([policy]);
      saveAs(blob, path);
    }
  }


  focusIn() {
    this.issueFocussed = true;
  }

  focusOut() { }


  loadFullCode() {
    if (this.currentIssue) {
      const context: CodeContext = {
        Location: this.currentIssue.location,
        ProjectID: this.projectSummary.ID,
        ScanID: this.currentScanID,
      };
      this.checkMateService.loadFullCode(context).subscribe(x => {
        this.code = x;
        this.firstLineNumber = 1;
      });
    }
  }

  fixIssue() {
    if (this.currentIssue) {
      const fix: ExcludeRequirement = {
        Issue: this.currentIssue,
        ProjectID: this.projectSummary.ID,
        What: this.selectedFix,
      };

      this.checkMateService.fixIssue(fix).subscribe(x => {
        if (x.Status === 'success') {
          this.policy = x.NewPolicy;
          this.snackBar.open(`Issue successfully remediated`, 'close');
          setTimeout(() => this.snackBar.dismiss(), 4000);
        }
      });
    }
  }


  truncate(x: number): number {
    return Math.floor(x);
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


  onSelect(data): void {
    const f = (data.name as string).toLowerCase();
    this.toggleFilter(f);
    this.paginateIssues(0);
  }

  toggleFilter(filter: string) {

    if (filter === 'critical') {
      this.filterForm.patchValue({ critical: !(this.filterForm.get('critical').value as boolean) });
    } else if (filter === 'high') {
      this.filterForm.patchValue({ high: !(this.filterForm.get('high').value as boolean) });
    } else if (filter === 'med') {
      this.filterForm.patchValue({ med: !(this.filterForm.get('med').value as boolean) });
    } else if (filter === 'low') {
      this.filterForm.patchValue({ low: !(this.filterForm.get('low').value as boolean) });
    } else if (filter === 'info') {
      this.filterForm.patchValue({ info: !(this.filterForm.get('info').value as boolean) });
    }
  }

  onSelectScan(data): void {
    const scanID = data.extra.scanID;
    this.checkMateService.getScanSummary(this.projectSummary.ID, scanID).subscribe(x => {
      this.setScanSummary(x);
    });
    this.setScanID(scanID);

  }

  // onDeactivate(data): void {
  //   console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  // }

  runScan() {
    this.scanning = true;
    this.showSpinner = true;
    const options: ProjectScanOptions = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ProjectID: this.projectID,
    };

    if (this.runScan$) {
      this.runScan$.unsubscribe();
    }

    this.runScan$ = this.checkMateService.runScan(options).subscribe(
      // msg => {
      //   console.log('got message', msg);

      //   this.showSpinner = false;
      //   if (this.isScanProgress(msg)) {
      //     const prog = msg;
      //     this.currentFile = prog.CurrentFile;
      //     if (prog.Total > 0) {
      //       this.progress = (100 * prog.Position) / prog.Total;
      //     }
      //     if (msg.Position === msg.Total) {
      //       console.log('got last message');

      //       this.currentFile = '';
      //       this.scanning = false;
      //       this.progress = 0;
      //       this.refreshProject(this.projectID);
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
      // () => { }
    );


  }



  isProjectSummary(msg: ScanStatus): msg is ProjectSummary {
    return (msg as ProjectSummary).ID !== undefined;
  }

  isScanSummary(msg: ScanStatus): msg is ScanSummary {
    return (msg as ScanSummary).Score !== undefined;
  }


  isScanProgress(msg: ScanStatus): msg is ScanProgress {
    return (msg as ScanProgress).Position !== undefined;
  }

  isScanEnd(msg: ScanStatus): msg is ScanEnd {
    return (msg as ScanEnd).Message !== undefined;
  }

  isDiagnostic(msg: ScanStatus): msg is SecurityDiagnostic {
    return (msg as SecurityDiagnostic).justification !== undefined;
  }

  trimDecimal(x: number): number {
    return Math.floor(x);
  }


}


interface FixTypes {
  fix: string;
  description: string;
}
