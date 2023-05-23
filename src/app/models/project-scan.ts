import { Project } from './project';

/* eslint-disable @typescript-eslint/naming-convention */
export interface ProjectSummary {
  ID: string;
  Name: string;
  Workspace: string;
  Repositories?: Repository[];
  LastScan?: Date;
  LastScanID?: string;
  LastScore?: ScanResult;
  LastScanSummary?: ScanSummary;
  ScoreTrend?: { [key: string]: number };
  ScanPolicy: ScanPolicy;
  IsBeingScanned?: boolean;
  CreationDate?: Date;
  LastModification?: Date;
}

export type ScanStatus = ScanResult | ScanProgress | SecurityDiagnostic | ScanEnd |
  ProjectScanOptions | Project | ProjectSummary | ScanSummary | MonitorOptions;
export interface ProjectDescription {
  Name: string;
  Workspace: string;
  Repositories?: Repository[];
  ScanPolicy?: ScanPolicy;
}

export interface ScanPolicy {
  ID?: string;
  Policy?: string;
  PolicyString?: string;
  Config?: Map<string, any>;
}


export interface ScanResult {
  Grade: string;
  Metric: number;
  // SubMetrics?: Map<string, number>;
  SubMetrics?: { [key: string]: number };
}

export interface Workspace {
  // Details: Map<string, WorkspaceDetail>;
  Details: { [key: string]: WorkspaceDetail };
}

export interface WorkspaceDetail {
  Summary: ScanSummary;
  ProjectSummaries: ProjectSummary[];
}

export interface ScanSummary {
  Score: ScanResult;
  AdditionalInfo: AdditionalInfo;
}

export interface AdditionalInfo {
  averageperfile: number;
  filecount: number;
  grade: string;
  criticalCount: number;
  highCount: number;
  informationalCount: number;
  issuespertype: number;
  lowCount: number;
  mediumCount: number;
  numberofsecretsreuse: number;
  reusedsecretscount: number;
  showsource: boolean;
  skippedcount: number;
  timestamp: string;
  prodandnonprodsecretreuse: ReusedSecret[];
}

export interface ReusedSecret {
  secret: string;
  productionlocations: SecretLocation;
  nonproductionlocations: SecretLocation;
}

export interface SecretLocation {
  location: string;
  highlightrange: CodeRange;
}

export interface Repository {
  Location: string;
  LocationType: string;
  GitServiceID?: string;
  Monitor: boolean;
  Attributes?: Map<string, any>;
}

export interface ProjectScanOptions {
  ProjectID: string;
  ScanID?: string;
  SecretSearchOptions?: SecretSearchOptions;
}

export interface MonitorOptions {
  ProjectIDs: string[];
}
export interface SecretSearchOptions {
  ShowSource?: boolean;
  ConfidentialFilesOnly?: boolean;
  CalculateChecksum?: boolean;
  Verbose?: boolean;
  ReportIgnored?: boolean;
  ExcludeTestFiles?: boolean;
}

export interface ScanEnd {
  Message: string;
}

export interface ScanProgress {
  ProjectID: string;
  ScaID: string;
  Position: number;
  Total: number;
  CurrentFile: string;
}

export interface SecurityDiagnostic {
  justification: Justification;
  range: CodeRange;
  location: string;
  source: string;
  sha256: string;
  tags: string[];
}

export interface Justification {
  headline: Evidence;
  reasons: Evidence[];
}

export interface Evidence {
  description: string;
  confidence: string;
}

export interface CodeRange {
  start: point;
  end: point;
}

interface point {
  line: number;
  character: number;
}

export interface GitCapabilities {
  GitServiceEnabled: boolean;
  GitLabEnabled: boolean;
  GitHubEnabled: boolean;
}
