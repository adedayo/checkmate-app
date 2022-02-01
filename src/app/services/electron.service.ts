import { Injectable } from '@angular/core';
import { NgxIsElectronService } from 'ngx-is-electron';


@Injectable({
  providedIn: 'root'
})
export class ElectronIPC {

  constructor(private electronService: NgxIsElectronService) {

  }

  /**
   * getAPIConfig
   */
  public getAPIConfig(): Promise<number> {
    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.invoke('api-config');
    }
    return new Promise(() =>
      17283 //default port chosen
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

  saveScanreport(path: string): Promise<string> {
    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.invoke('save-report', path);
    }
    return new Promise(() =>
      []
    );
  }

  savePolicy(path: string, policy: string): Promise<string> {
    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.invoke('save-policy', path, policy);
    }
    return new Promise(() =>
      []
    );
  }
}
