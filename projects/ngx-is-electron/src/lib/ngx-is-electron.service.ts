import { Injectable } from '@angular/core';
import * as Electron from 'electron';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class NgxIsElectronService {
  private _electron: any;

  private get electron() {
    if (!this._electron) {
      if (window && window.require) {
        this._electron = window.require('electron');
        return this._electron
      }
      return null;
    }
    return this._electron;
  }

  constructor() { }

  public get isElectronApp(): boolean {
    return !!window.navigator.userAgent.match(/Electron/);
  }

  public get ipcRenderer(): Electron.IpcRenderer {
    return this.electron ? this.electron.ipcRenderer : null;
  }
}


