import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { sidebarAnimation, iconAnimation, labelAnimation } from 'src/app/animations';
import { ThrowStmt } from '@angular/compiler';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    sidebarAnimation(),
    iconAnimation(),
    labelAnimation(),
  ]
})
export class SidebarComponent implements OnInit {
  sidebarState: string;
  gitServiceEnabled = false;

  constructor(
    private sidebarService: SidebarService,
    private checkMate: CheckMateService
  ) { }

  ngOnInit() {
    this.sidebarService.sidebarStateObservable$.
      subscribe((newState: string) => {
        this.sidebarState = newState;
      });

    this.checkMate.gitCapabilities.subscribe(cap => {
      this.gitServiceEnabled = cap.GitServiceEnabled;
    });
  }

  toggleSideNav() {
    if (this.sidebarState === 'close') {
      this.sidebarService.toggle();
    }
  }

  toggleSideNavOnLeave() {
    if (this.sidebarState === 'open') {
      this.sidebarService.toggle();
    }
  }
}
