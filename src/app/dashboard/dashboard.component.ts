import { Component, OnInit } from '@angular/core';
import { ElectronIPC } from '../services/electron.service';
import { ElectronService } from "ngx-electron";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private ipc: ElectronIPC, private electron: ElectronService) { }

  ngOnInit(): void {
    if (this.electron.isElectronApp) {
      this.ipc.getAPIConfig().then(config => {
        console.log('Got Port', JSON.stringify(config));
      })
    }

  }

}
