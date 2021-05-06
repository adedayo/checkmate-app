import { Repository, ScanPolicy } from './project-scan';

/* eslint-disable @typescript-eslint/naming-convention */
export interface Project {
  ID: string;
  Name: string;
  Repositories: Repository[];
  ScanIDs: string[];
  ScanPolicy: ScanPolicy;
}


export interface PaginatedSearch {
  ProjectID: string;
  ScanID: string;
  PageSize: number;
  Page: number;
}
