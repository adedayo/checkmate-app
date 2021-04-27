/* eslint-disable @typescript-eslint/naming-convention */
export interface ProjectSummary {
  ID: string;
  Name: string;
  Repositories?: Repository[];
  LastScan?: Date;
  LastScanID?: string;
  LastScore?: ScanResult;
  IsBeingScanned?: boolean;
  CreationDate?: Date;
  LastModification?: Date;
}

export interface ProjectDescription {
  Name: string;
  Repositories?: Repository[];
  ScanPolicy?: ScanPolicy;
}

export interface ScanPolicy {
  ID?: string;
  Policy?: string;
  Config?: Map<string, any>;
}

// export interface ExcludeDefinition {
//   //These specify regular expressions of matching strings that should be ignored as secrets anywhere they are found
//   GloballyExcludedRegExs: string;
//   //These specify strings that should be ignored as secrets anywhere they are found
//   GloballyExcludedStrings: string[];
//   //These specify regular expressions that ignore files whose paths match
//   PathExclusionRegExs: string[];
//   //These specify sets of strings that should be excluded in a given file. That is filepath -> Set(strings)
//   PerFileExcludedStrings: Map<string, string[]>;
//   //These specify sets of regular expressions that if matched on a path
//   //matched by the filepath key should be ignored. That is filepath_regex -> Set(regex)
//   //This is a quite versatile construct and can model the four above
//   PathRegexExcludedRegExs: Map<string, string[]>;
// }

export interface ScanResult {
  Grade: string;
  Metric: number;
  SubMetrics?: Map<string, number>;
}


export interface Repository {
  Location: string;
  LocationType: string;
}

export interface ProjectScanOptions {
  ProjectID: string;
  ScanID?: string;
  SecretSearchOptions?: SecretSearchOptions;
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
  Justification: Justification;
  Location: string;
}

export interface Justification {
  Headline: Evidence;
  Confidence: string;
}

export interface Evidence {
  Description: string;
  Confidence: string;
}
