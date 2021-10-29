import { Repository, ScanPolicy, SecurityDiagnostic } from './project-scan';

/* eslint-disable @typescript-eslint/naming-convention */
export interface Project {
  ID: string;
  Name: string;
  Workspace: string;
  Repositories: Repository[];
  ScanIDs: string[];
  ScanPolicy: ScanPolicy;
}


export interface PaginatedSearch {
  ProjectID: string;
  ScanID: string;
  PageSize: number;
  Page: number;
  Filter?: IssueFilter;
}

export interface IssueFilter {
  Confidence?: string[];
  Tags?: string[];
  ConfidentialFilesOnly?: boolean;
}

export interface PagedResult {
  Total: number;
  Page: number;
  Diagnostics: SecurityDiagnostic[];
}

export interface ExcludeRequirement {
  What: string;
  Issue: SecurityDiagnostic;
  ProjectID: string;
}

export interface PolicyUpdateResult {
  Status: string;
  NewPolicy: string;
}

export interface CodeContext {
  Location: string;
  ProjectID: string;
  ScanID: string;
}
