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
