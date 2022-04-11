import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { sidebarAnimation, iconAnimation, labelAnimation } from 'src/app/animations';
import { CheckMateService } from '../services/checkmate.service';
import { Subscription } from 'rxjs';

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
export class SidebarComponent implements OnInit, OnDestroy {
  sidebarState: string;
  gitServiceEnabled = false;
  subscriptions: Subscription;

  constructor(
    private sidebarService: SidebarService,
    private checkMate: CheckMateService
  ) { }


  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  ngOnInit() {
    this.subscriptions = this.sidebarService.sidebarStateObservable$.
      subscribe((newState: string) => {
        this.sidebarState = newState;
      });

    this.subscriptions.add(this.checkMate.gitCapabilities.subscribe(cap => {
      this.gitServiceEnabled = cap.GitServiceEnabled;
    }));
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
