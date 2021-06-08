/* eslint-disable @typescript-eslint/naming-convention */
import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcludeRequirement, IssueFilter, PagedResult, PaginatedSearch, Project } from '../models/project';
import { ProjectSummary, ScanSummary, SecurityDiagnostic } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';
import { curveBumpX } from 'd3-shape';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project: Project;
  projectSummary: ProjectSummary;
  scanSummary: ScanSummary;
  selectedFix = 'ignore_here';
  currentIssue: SecurityDiagnostic;
  currentScanID: string;
  reselect = false;

  expandReusedSecretsPanel = false;

  filter: IssueFilter = {
    Confidence: []
  };

  code = '';
  policy = '';
  issueFocussed = false;
  pagingForm: FormGroup;
  showPolicy = false;
  fixForm: FormGroup;
  pagedResult: PagedResult;
  pageSizeValue = 10;
  defaultPageSizes = [10, 20, 50, 100, 500];
  fixes: FixTypes[] = [
    {
      fix: 'ignore_here',
      description: 'Ignore this issue in this file'
    },
    {
      fix: 'ignore_everywhere',
      description: 'Ignore this issue everywhere'
    },
    {
      fix: 'ignore_file',
      description: 'Ignore this file'
    },
  ];



  curve: any = curveBumpX;
  graphData = [];
  timelineView: any[] = [570, 300];
  issueCounts: any[] = this.graph(0, 0, 0, 0);
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
    domain: ['red', 'gold', 'blue', 'green']
  };
  project$: Subscription;
  projectSummary$: Subscription;
  size$: Subscription;
  fix$: Subscription;
  advancedFix$: Subscription;

  constructor(private fb: FormBuilder, private router: Router,
    private checkMateService: CheckMateService) {
    this.pagingForm = this.fb.group({
      size: [this.pageSizeValue],
    });

    this.fixForm = this.fb.group({
      fix: [this.selectedFix],
      advancedFix: [false],
    });


  }



  ngOnInit() {
    const path = this.router.url;
    if (path) {
      //get project ID from the route
      const subPaths = path.split('/');
      const projectID = subPaths[subPaths.length - 1];

      this.project$ = this.checkMateService.getProject(projectID).subscribe(proj => this.setProject(proj));

      this.projectSummary$ = this.checkMateService.getProjectSummary(projectID).subscribe(x => {
        this.setProjectSummary(x);
      }
      );
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
  }


  ngOnDestroy(): void {
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
  }

  updateGraph() {
    if (this.projectSummary.LastScore && this.projectSummary.LastScore.SubMetrics) {
      const data = [];
      {
        for (const [k, v] of Object.entries(this.projectSummary.LastScore.SubMetrics)) {
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
    this.setScanSummary(x.LastScanSummary);
    this.updateGraph();
  }

  setScanSummary(x: ScanSummary) {
    if (x) {
      this.scanSummary = x;
      if (x.AdditionalInfo) {
        const data = x.AdditionalInfo;
        this.issueCounts = this.graph(data.highcount, data.mediumcount, data.lowcount, data.informationalcount);
      }
    }
  }

  get pageSize(): FormControl {
    return this.pagingForm.get('size') as FormControl;
  }

  setProject(proj: Project) {
    if (!proj || proj.ID === '') {
      return;
    }
    this.project = proj;
    if (proj.ScanPolicy && proj.ScanPolicy.PolicyString) {
      this.policy = proj.ScanPolicy.PolicyString;
    }
    this.setScanID(this.project.ScanIDs[0]);

  }

  setScanID(id: string) {
    this.currentScanID = id;
    this.paginateIssues(0);
  }

  paginateIssues(page: number) {
    const search: PaginatedSearch = {
      ProjectID: this.project.ID,
      ScanID: this.currentScanID,
      PageSize: this.pageSizeValue,
      Page: page,
      Filter: this.filter
    };

    this.checkMateService.getIssues(search).subscribe(result => {
      this.pagedResult = result;
      this.reselect = true;
    });
  }

  savePolicy() {
    this.checkMateService.updateProject(this.project.ID, {
      Name: this.project.Name,
      Repositories: this.project.Repositories,
      ScanPolicy: {
        ID: this.project.ScanPolicy.ID,
        Config: this.project.ScanPolicy.Config,
        Policy: JSON.stringify(this.project.ScanPolicy.Policy),
        PolicyString: this.policy
      }
    }).subscribe(proj => {
      this.setProject(proj);
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
    }
  }

  pageListener(event: string) {
    this.issueFocussed = false;
    if (event === 'top') {
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

  focusIn() {
    this.issueFocussed = true;
  }

  focusOut() {
  }

  fixIssue() {
    if (this.currentIssue) {
      const fix: ExcludeRequirement = {
        Issue: this.currentIssue,
        ProjectID: this.project.ID,
        What: this.selectedFix,
      };

      this.checkMateService.fixIssue(fix).subscribe(x => {
        console.log('Got Fix response', x);
        if (x.Status === 'success') {
          this.policy = x.NewPolicy;
        }
      });
    }


  }

  addClass(i: number): string {
    if (i % 2 === 0) {
      return ' bg-blue-100 ';
    }
    return '';
  }

  truncate(x: number): number {
    return Math.floor(x);
  }

  graph(high: number, med: number, low: number, info: number): any[] {
    return [
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
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    const f = data.name;
    if (this.filter.Confidence.includes(f)) {
      this.filter.Confidence.splice(this.filter.Confidence.indexOf(f));
    } else {
      this.filter.Confidence.push(f);
    }
    this.paginateIssues(0);
  }

  onSelectScan(data): void {
    console.log(data.extra.scanID);
    const scanID = data.extra.scanID;
    this.checkMateService.getScanSummary(this.project.ID, scanID).subscribe(x => {
      // console.log('Got scan summary', x);
      this.setScanSummary(x);
    });
    this.setScanID(scanID);

  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }


}


interface FixTypes {
  fix: string;
  description: string;
}
