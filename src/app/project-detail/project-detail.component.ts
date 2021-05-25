/* eslint-disable @typescript-eslint/naming-convention */
import {
  AfterViewChecked, Component, OnInit
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcludeRequirement, PagedResult, Project } from '../models/project';
import { ScanPolicy, SecurityDiagnostic } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project;
  code = '';
  policy = '';
  issueFocussed = false;
  pagingForm: FormGroup;
  showPolicy = false;
  fixForm: FormGroup;
  pagedResult: PagedResult;
  pageSizeValue = 10;
  defaultPageSizes = [10, 20, 50, 100];
  fixes: fixTypes[] = [
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
  selectedFix = 'ignore_here';
  currentIssue: SecurityDiagnostic;
  currentScanID: string;
  reselect = false;


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

      this.checkMateService.getProject(projectID).subscribe(proj => this.setProject(proj));
    }

    this.pagingForm.get('size').valueChanges.subscribe(x => {
      this.pageSizeValue = x;
      let currentPage = 0;
      if (this.pagedResult) {
        currentPage = this.pagedResult.Page;
      }
      this.paginateIssues(currentPage);
    });

    this.fixForm.get('fix').valueChanges.subscribe(x => {
      this.selectedFix = x;
    });

    this.fixForm.get('advancedFix').valueChanges.subscribe(x => {
      this.showPolicy = x;
    });
  }

  get pageSize(): FormControl {
    return this.pagingForm.get('size') as FormControl;
  }

  setProject(proj: Project) {
    console.log('got project', proj);

    if (proj.ID === '') {
      return;
    }
    this.project = proj;
    if (proj.ScanPolicy && proj.ScanPolicy.Policy) {
      this.policy = JSON.stringify(proj.ScanPolicy.Policy, null, ' ');
    }
    this.currentScanID = this.project.ScanIDs[0];
    this.paginateIssues(0);
  }

  paginateIssues(page: number) {
    this.checkMateService.getIssues(
      {
        ProjectID: this.project.ID,
        ScanID: this.currentScanID,
        PageSize: this.pageSizeValue,
        Page: page,
      }).subscribe(result => {
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
        Policy: this.policy
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

}


interface fixTypes {
  fix: string;
  description: string;
}
