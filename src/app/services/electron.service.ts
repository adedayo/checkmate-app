import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';


@Injectable({
  providedIn: 'root'
})
export class ElectronIPC {

  constructor(private electronService: ElectronService) {

  }

  /**
   * getAPIConfig
   */
  public getAPIConfig(): Promise<string> {
    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.invoke('api-config');
    }
    return new Promise(() =>
      '17283' //default port chosen
    );
  }

  getCodePath(): Promise<string[]> {

    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.invoke('get-codebase');
    }

    return new Promise(() =>
      []
    );
  }

}
