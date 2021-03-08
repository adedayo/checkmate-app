import { Component, OnInit } from '@angular/core';
import { mainContentAnimation } from './animations';
import { SidebarService } from './services/sidebar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    mainContentAnimation(),
  ]
})
export class AppComponent implements OnInit {

  title = 'checkmate-app';

  sidebarState: string;

  constructor(private sidebarService: SidebarService) {

  }

  ngOnInit(): void {
    this.sidebarService.sidebarStateObservable$.subscribe((newState: string) => {
      this.sidebarState = newState;
    })
  }

}
