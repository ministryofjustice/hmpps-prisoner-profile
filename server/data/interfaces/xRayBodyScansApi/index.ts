export interface ScanCountRequest {
  prisonerNumber: string
  fromStartDate?: Date | undefined
  toStartDate?: Date | undefined
}

export interface ScanCountResponse {
  prisonerNumber: string
  nomisCount: number
  dpsCount: number
  totalCount: number
}

export interface XRayBodyScansApiClient {
  /**
   * Returns the total number of x-ray body scans for the given prisoner in specified
   * date range or this calendar year.
   * If the prisoner is not found, the count will default to zero.
   */
  countScans(request: ScanCountRequest): Promise<ScanCountResponse>
}
