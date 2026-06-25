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
  countScans(request: ScanCountRequest): Promise<ScanCountResponse>
}
