import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ElectronIPC } from "./electron.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CheckMateService {

  apiPort = '17283'
  version = '';
  constructor(private http: HttpClient, private electron: ElectronIPC) {
    this.electron.getAPIConfig().then(port => {
      this.apiPort = JSON.stringify(port)
    })
  }


  public getVersion(): Observable<string> {
    console.log(`calling API with port ${this.apiPort}`);
    return this.http.get<string>(`http://localhost:${this.apiPort}/api/version`)
  }


}
