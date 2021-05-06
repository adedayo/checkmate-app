/* eslint-disable @typescript-eslint/naming-convention */
import { ThrowStmt } from '@angular/compiler';
import {
  AfterViewChecked, Component, ChangeDetectorRef, ElementRef,
  OnInit, QueryList, ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { Issue } from '../models/issues';
import { Project } from '../models/project';
import { SecurityDiagnostic } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, AfterViewChecked {

  @ViewChildren('incidents') incidents: QueryList<ElementRef>;
  elementRefs: ElementRef[];
  project: Project;
  code = '';
  issueFocussed = false;
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers',
    'Moccasins', 'Sneakers', 'another', 'type', 'of', 'shoe',

  ];
  issues: SecurityDiagnostic[];
  currentIssue: SecurityDiagnostic;

  constructor(private router: Router,
    private checkMateService: CheckMateService,
    private cd: ChangeDetectorRef
  ) { }

  ngAfterViewChecked(): void {


    // console.log('incidents', this.incidents);
    // console.log('length ', this.incidents.length);
    this.elementRefs = [];
    this.incidents.forEach((item, index) => {
      this.elementRefs.push(item);

      // console.log('item', index, item);

    });


  }

  ngOnInit() {

    const path = this.router.url;
    if (path) {
      const subPaths = path.split('/');
      const projectID = subPaths[subPaths.length - 1];
      this.checkMateService.getProject(projectID).subscribe(proj => {
        this.project = proj;
        this.paginateIssues(5, 0, this.project.ScanIDs[0]);
      });


    }
  }


  paginateIssues(pageSize: number, page: number, scanID: string) {
    this.checkMateService.getIssues(
      {
        ProjectID: this.project.ID,
        ScanID: scanID,
        PageSize: pageSize,
        Page: page,
      }).subscribe(issues => {
        this.issues = issues;
        // console.log('got issues', issues);

      });
  }


  // keyPressed(event: Event, i: number) {
  //   console.log(event);
  //   // if (event.key === 'ArrowDown') {
  //   const tab = new KeyboardEvent('keydown', {
  //     bubbles: true,
  //     key: 'Tab',
  //     code: 'Tab',
  //   });
  //   event.preventDefault();
  //   // console.log('path', event.composedPath());
  //   // document.dispatchEvent(tab);
  //   if (i < 8) {
  //     const e = (this.elementRefs[i + 1].nativeElement as HTMLElement);
  //     // e.dispatchEvent(tab);
  //     console.log('about to focus', e);
  //     // e.dispatchEvent(tab);
  //     e.focus();

  //     // setTimeout(() => e.click(), 0);

  //   }
  //   // event.composedPath()[2].dispatchEvent(tab);

  //   // event.target.dispatchEvent(tab);
  //   // window.dispatchEvent(tab);
  //   // const e = event.target.dispatchEvent(tab);
  //   // console.log(`outcome of dispatch = ${e}`);


  //   // this.incidents.nativeElement.dispatchEvent(tab);
  //   // }

  // }

  focussed(issue: SecurityDiagnostic) {
    if (issue) {
      this.focusIn();
      this.currentIssue = issue;
    }
  }

  focusOut() {
    this.issueFocussed = false;
  }

  focusIn() {
    this.issueFocussed = true;
  }

  addClass(i: number): string {
    if (i % 2 === 0) {
      return ' bg-gray-200 ';
    }
    return '';
  }

}
