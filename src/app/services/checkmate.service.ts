import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronIPC } from './electron.service';
import { Observable } from 'rxjs';
import { ProjectScanOptions, ProjectSummary, ScanEnd, ScanProgress, ScanResult } from '../models/project-scan';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class CheckMateService {

  apiPort = '17283';
  api = `http://localhost:${this.apiPort}/api`;
  version = '';



  constructor(private http: HttpClient, private electron: ElectronIPC) {
    this.electron.getAPIConfig().then(port => {
      this.apiPort = JSON.stringify(port);
    });
  }

  public getVersion(): Observable<string> {
    return this.http.get<string>(`${this.api}/version`);
  }

  public getProjectSummaries(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${this.api}/projectsummaries`);
  }


  runScan(options: ProjectScanOptions): WebSocketSubject<ScanResult | ScanProgress | ScanEnd | ProjectScanOptions> {
    console.log(options);
    const ws = webSocket<ScanResult | ScanProgress | ScanEnd | ProjectScanOptions>(`ws://localhost:${this.apiPort}/api/secrets/scan`);
    ws.next(options);
    return ws;
  }

  getProjectSummary(projID: string): Observable<ProjectSummary> {
    return this.http.get<ProjectSummary>(`${this.api}/projectsummary/${projID}`);
  }

}
