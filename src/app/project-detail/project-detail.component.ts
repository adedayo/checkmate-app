/* eslint-disable @typescript-eslint/naming-convention */
import { ThrowStmt } from '@angular/compiler';
import {
  AfterViewChecked, Component, ElementRef,
  OnInit, ViewChild
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PagedResult, Project } from '../models/project';
import { SecurityDiagnostic } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, AfterViewChecked {
  project: Project;
  code = '';
  issueFocussed = false;
  pagingForm: FormGroup;
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
  currentIssue: SecurityDiagnostic;
  currentScanID: string;
  reselect = false;


  constructor(private fb: FormBuilder, private router: Router,
    private checkMateService: CheckMateService) {
    this.pagingForm = this.fb.group({
      size: [10],
    });

    this.fixForm = this.fb.group({
      fix: [''],
    });
  }

  ngAfterViewChecked(): void { }

  ngOnInit() {
    const path = this.router.url;
    if (path) {
      //get project ID from the route
      const subPaths = path.split('/');
      const projectID = subPaths[subPaths.length - 1];
      this.checkMateService.getProject(projectID).subscribe(proj => {
        this.project = proj;
        this.currentScanID = this.project.ScanIDs[0];
        this.paginateIssues(0);
      });
    }

    this.pagingForm.get('size').valueChanges.subscribe(x => {
      this.pageSizeValue = x;
      let currentPage = 0;
      if (this.pagedResult) {
        currentPage = this.pagedResult.Page;
      }
      this.paginateIssues(currentPage);
    });
  }

  get pageSize(): FormControl {
    return this.pagingForm.get('size') as FormControl;
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
