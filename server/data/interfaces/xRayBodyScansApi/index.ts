import type { PageRequest } from '../PageRequest'

export interface ListScansRequest extends PageRequest<'scanDate'> {
  fromScanDate?: Date | undefined
  toScanDate?: Date | undefined
}

export interface ScanResponse {
  id: string
  prisonerNumber: string
  prisonId: string
  scanDate: Date
  justification: string
  justificationDescription: string
  outcome: string
  outcomeDescription: string
  typeOfFind: string | null
  typeOfFindDescription: string | null
  caseNoteId: string | null
  mergedFromPrisonerNumber: string | null
  mergedAt: Date | null
  createdAt: Date
  createdBy: string
  lastModifiedAt: Date
  lastModifiedBy: string
}

export interface ScanSummaryResponse {
  prisonerNumber: string
  nomisCount: number
  dpsCount: number
  totalCount: number
  positiveCount: number
  negativeCount: number
  inconclusiveCount: number
  annualLimit: number
  remainingScans: number
  nearingScanLimit: boolean
  atScanLimit: boolean
  fromScanDate: Date
  toScanDate: Date
}

export interface XRayBodyScansApiClient {
  /**
   * Returns recorded x-ray body scans for the given prisoner.
   * If the prisoner is not found, the list is empty.
   * Ensure the prisoner exists prior to use.
   */
  listScans(prisonerNumber: string, request?: ListScansRequest): Promise<ScanResponse[]>

  /**
   * Returns a summary of x-ray body scans for the given prisoner for this calendar year.
   * If the prisoner is not found, the counts will default to zero.
   */
  getScanSummary(prisonerNumber: string): Promise<ScanSummaryResponse>
}
