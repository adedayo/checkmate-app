/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronIPC } from './electron.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ProjectDescription, ProjectScanOptions, ProjectSummary,
  ScanStatus, ScanSummary, Workspace, GitCapabilities, MonitorOptions
} from '../models/project-scan';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CodeContext, ExcludeRequirement, IssueFilter, PagedResult, PaginatedSearch, PolicyUpdateResult, Project } from '../models/project';
import { EnvironmentsService } from './environments.service';
import { GitLabPagedSearch, GitLabProjectSearchResult } from '../models/gitlab-project';
import { GitService } from '../models/git';
import { GitHubPagedSearch, GitHubProjectSearchResult } from '../models/github-project';
import { NgxIsElectronService } from 'ngx-is-electron';

@Injectable({
  providedIn: 'root'
})
export class CheckMateService {

  apiPort = 17283;
  api = `http://localhost:${this.apiPort}/api`;//default, values set from environment service
  wsAPI = `ws://localhost:${this.apiPort}/api`;//default, values set from environment service

  private showSpinner = new BehaviorSubject<boolean>(false);

  private gitCaps = new BehaviorSubject<GitCapabilities>({
    GitServiceEnabled: false,
    GitHubEnabled: false,
    GitLabEnabled: false,
  });


  private gitlabProjects$: Map<string, GitLabProjectSearchResult> = new Map();
  private githubProjects$: Map<string, GitHubProjectSearchResult> = new Map();


  constructor(private http: HttpClient, electronService: NgxIsElectronService,
    private electron: ElectronIPC, private env: EnvironmentsService) {
    if (electronService.isElectronApp) {
      this.electron.getAPIConfig().then(port => {
        this.apiPort = port;
      }).catch((err) => {
        const port = this.env.getEnvironment().apiPort;
        this.apiPort = port;
        console.log(`error getting API port but attempting default port ${port}`, err);
      });
    }
    this.api = `${this.env.getEnvironment().httpProtocol}://${this.env.getEnvironment().apiHost}:${this.apiPort}/${this.env.getEnvironment().apiPath}`;
    this.wsAPI =
      `${this.env.getEnvironment().wsProtocol}://${this.env.getEnvironment().apiHost}:${this.apiPort}/${this.env.getEnvironment().apiPath}`;
    this.http.get<GitCapabilities>(`${this.api}/git/capabilities`).subscribe(cap => this.gitCaps.next(cap));
  }

  public getVersion(): Observable<string> {
    return this.http.get<string>(`${this.api}/version`);
  }

  public createGitHubIntegration(integration: GitService): Observable<GitService[]> {
    return this.http.post<GitService[]>(`${this.api}/github/integrate`, integration);
  }

  public deleteGitHubIntegration(id: string): Observable<GitService[]> {
    return this.http.post<GitService[]>(`${this.api}/github/deleteintegration`, { ID: id });
  }

  public getGitHubIntegrations(): Observable<GitService[]> {
    return this.http.get<GitService[]>(`${this.api}/github/integrations`);
  }

  get gitHubProjects(): Map<string, GitHubProjectSearchResult> {
    return this.githubProjects$;
  }


  public createGitLabIntegration(integration: GitService): Observable<GitService[]> {
    return this.http.post<GitService[]>(`${this.api}/gitlab/integrate`, integration);
  }

  public deleteGitLabIntegration(id: string): Observable<GitService[]> {
    return this.http.post<GitService[]>(`${this.api}/gitlab/deleteintegration`, { ID: id });
  }

  public getGitLabIntegrations(): Observable<GitService[]> {
    return this.http.get<GitService[]>(`${this.api}/gitlab/integrations`);
  }


  public gitHubDiscover(page: GitHubPagedSearch): Observable<GitHubProjectSearchResult> {
    return this.http.post<GitHubProjectSearchResult>(`${this.api}/github/discover`, page).pipe(
      map(y => {
        if (y.Projects) {
          y.Projects.forEach(z => z.InstanceID = y.InstanceID);
        }
        return y;
      }),
    );
  }

  public gitLabDiscover(page: GitLabPagedSearch): Observable<GitLabProjectSearchResult> {
    return this.http.post<GitLabProjectSearchResult>(`${this.api}/gitlab/discover`, page).pipe(
      map(y => {
        if (y.Projects) {
          y.Projects.forEach(z => z.InstanceID = y.InstanceID);
        }
        return y;
      }),
    );
  }



  get gitLabProjects(): Map<string, GitLabProjectSearchResult> {
    return this.gitlabProjects$;
  }

  get gitCapabilities(): Observable<GitCapabilities> {
    return this.gitCaps.asObservable();
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


  public downloadProjectScores(workspace: string): Observable<string> {
    return this.http.get<string>(`${this.api}/projectsummariesreport/${workspace}`);
  }

  runScan(options: ProjectScanOptions): WebSocketSubject<ScanStatus> {
    const ws = webSocket<ScanStatus>(`${this.wsAPI}/secrets/scan`);
    ws.next(options);
    return ws;
  }

  monitorProjectScan(options: MonitorOptions): WebSocketSubject<ScanStatus> {
    const ws = webSocket<ScanStatus>(`${this.wsAPI}/monitor/projectscan`);
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

  loadFullCode(context: CodeContext): Observable<string> {
    return this.http.post<string>(`${this.api}/project/issues/codecontext`, context);
  }

  public downloadWorkspaceIssuesCSVReportElectron(workspace: string, filter: IssueFilter): Observable<string> {
    return this.http.post<string>(`${this.api}/workspaceissueselectron/${workspace}`, filter);
  }

  downloadWorkspaceIssuesCSVReport(currentWorkspaceName: string, filter: IssueFilter): Observable<any> {
    return this.http.post(`${this.api}/downloadworkspaceissues/${currentWorkspaceName}`, filter, {
      responseType: 'blob',
      observe: 'body',
      reportProgress: true
    });
  }

  downloadWorkspaceCSVReport(currentWorkspaceName: string): Observable<any> {
    return this.http.get(`${this.api}/downloadworkspacereport/${currentWorkspaceName}`, {
      responseType: 'blob',
      observe: 'body',
      reportProgress: true
    });
  }

  getPDFReportPath(projID: string, scanID: string): Observable<string> {
    return this.http.get<string>(`${this.api}/scanreport/${projID}/${scanID}`);
  }


  downloadPDFReport(projID: string, scanID: string): Observable<any> {
    return this.http.get(`${this.api}/downloadscanreport/${projID}/${scanID}`, {
      responseType: 'blob',
      observe: 'body',
      reportProgress: true
    });
  }

  downloadCSVReport(projID: string, scanID: string, filter: IssueFilter): Observable<any> {
    return this.http.post(`${this.api}/downloadcsvscanreport/${projID}/${scanID}`, filter, {
      responseType: 'blob',
      observe: 'body',
      reportProgress: true,
    });
  }

  getCSVReportPath(projID: string, scanID: string, filter: IssueFilter): Observable<string> {
    return this.http.post<string>(`${this.api}/csvscanreport/${projID}/${scanID}`, filter);
  }

  createProject(projDesc: ProjectDescription): Observable<ProjectSummary> {
    return this.http.post<ProjectSummary>(
      `${this.api}/createproject`,
      projDesc
    );
  }

  deleteProject(projectID: string): Observable<string> {
    return this.http.post<string>(`${this.api}/deleteproject`, { ProjectID: projectID });
  }

  updateProject(projectID: string, projDesc: ProjectDescription): Observable<Project> {
    return this.http.post<Project>(`${this.api}/updateproject/${projectID}`, projDesc);
  }
}
