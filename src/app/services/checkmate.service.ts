import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronIPC } from './electron.service';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ProjectDescription, ProjectScanOptions, ProjectSummary,
  ScanStatus, ScanSummary, Workspace
} from '../models/project-scan';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ExcludeRequirement, PagedResult, PaginatedSearch, PolicyUpdateResult, Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class CheckMateService {

  apiPort = 17283;
  api = `http://localhost:${this.apiPort}/api`;

  private showSpinner = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private electron: ElectronIPC) {
    this.electron.getAPIConfig().then(port => {
      this.apiPort = port;
      this.api = `http://localhost:${port}/api`;
    }).catch((err) => {
      const port = 17283;
      this.apiPort = port;
      console.log(`error getting API port but attempting default port ${port}`, err);
      this.api = `http://localhost:${port}/api`;
    });
  }

  public getVersion(): Observable<string> {
    return this.http.get<string>(`${this.api}/version`);
  }

  get spinnerState(): Observable<boolean> {
    return this.showSpinner.asObservable();
  }


  public setSpinnerState(v: boolean) {
    this.showSpinner.next(v);
  }



  getDefaultPolicy(): Observable<string> {
    return this.http.get<string>(`${this.api}/secrets/defaultpolicy`);
  }

  public getProjectSummaries(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${this.api}/projectsummaries`);
  }

  public downloadProjectScores(): Observable<string> {
    return this.http.get<string>(`${this.api}/projectsummariesreport`);
  }

  runScan(options: ProjectScanOptions): WebSocketSubject<ScanStatus> {
    const ws = webSocket<ScanStatus>(`ws://localhost:${this.apiPort}/api/secrets/scan`);
    ws.next(options);
    return ws;
  }

  getProjectSummary(projID: string): Observable<ProjectSummary> {
    return this.http.get<ProjectSummary>(`${this.api}/projectsummary/${projID}`);
  }

  getWorkspaceSummaries(): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.api}/workspaces`);
  }

  getScanSummary(projID: string, scanID: string): Observable<ScanSummary> {
    return this.http.get<ScanSummary>(`${this.api}/scansummary/${projID}/${scanID}`);
  }

  getProject(projID: string): Observable<Project> {
    return this.http.get<Project>(`${this.api}/project/${projID}`);
  }


  getIssues(paginated: PaginatedSearch): Observable<PagedResult> {
    return this.http.post<PagedResult>(`${this.api}/project/issues`, paginated);
  }

  fixIssue(fix: ExcludeRequirement): Observable<PolicyUpdateResult> {
    return this.http.post<PolicyUpdateResult>(`${this.api}/project/issues/fix`, fix);
  }

  downloadReport(projID: string, scanID: string): Observable<string> {
    return this.http.get<string>(`${this.api}/scanreport/${projID}/${scanID}`);
  }

  downloadCSVReport(projID: string, scanID: string): Observable<string> {
    return this.http.get<string>(`${this.api}/csvscanreport/${projID}/${scanID}`);
  }

  createProject(projDesc: ProjectDescription): Observable<ProjectSummary> {
    return this.http.post<ProjectSummary>(
      `${this.api}/createproject`,
      projDesc
    );
  }

  updateProject(projectID: string, projDesc: ProjectDescription): Observable<Project> {
    return this.http.post<Project>(
      `${this.api}/updateproject/${projectID}`,
      projDesc
    );
  }
}
