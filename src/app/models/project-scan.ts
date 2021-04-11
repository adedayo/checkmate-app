export interface ProjectSummary {
  ID: string
  Name: string
  Repositories?: Repository[]
  LastScan?: Date
  LastScanID?: string
  LastScore?: ScanResult
  IsBeingScanned?: boolean
  CreationDate?: Date
  LastModification?: Date
}

export interface ScanResult {
  Grade: string
  Metric: number
  SubMetrics?: Map<string, number>
}


export interface Repository {
  Location: string
  LocationType: string
}

export interface ProjectScanOptions {
  ProjectID: string
  ScanID?: string
  SecretSearchOptions?: SecretSearchOptions
}

export interface SecretSearchOptions {
  ShowSource?: boolean
  ConfidentialFilesOnly?: boolean
  CalculateChecksum?: boolean
  Verbose?: boolean
  ReportIgnored?: boolean
  ExcludeTestFiles?: boolean
}

export interface ScanEnd {
  Message: string
}

export interface ScanProgress {
  ProjectID: string
  ScaID: string
  Position: number
  Total: number
  CurrentFile: string
}
