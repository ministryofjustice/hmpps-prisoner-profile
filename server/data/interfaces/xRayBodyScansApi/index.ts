export interface ScanSummaryRequest {
  prisonerNumber: string
  fromScanDate?: Date | undefined
  toScanDate?: Date | undefined
}

export interface ScanSummaryResponse {
  prisonerNumber: string
  nomisCount: number
  dpsCount: number
  totalCount: number
  positiveCount: number
  negativeCount: number
  inconclusiveCount: number
  remainingScans: number
  fromScanDate: Date
  toScanDate: Date
}

export interface XRayBodyScansApiClient {
  /**
   * Returns a summary of x-ray body scans for the given prisoner in specified
   * date range or this calendar year.
   * If the prisoner is not found, the counts will default to zero.
   */
  getScanSummary(request: ScanSummaryRequest): Promise<ScanSummaryResponse>
}
