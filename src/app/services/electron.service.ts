import { Injectable } from '@angular/core';
import { ElectronService } from "ngx-electron";


@Injectable({
  providedIn: 'root'
})
export class ElectronIPC {

  constructor(private electronService: ElectronService) {

  }

  /**
   * getAPIConfig
   */
  public getAPIConfig(): Promise<any> {
    if (this.electronService.isElectronApp) {
      return this.electronService.ipcRenderer.invoke("api-config")
    }
    return new Promise(() => {
      return "17283" //default port chosen
    })
  }

}
