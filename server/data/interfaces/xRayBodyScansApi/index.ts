import type { PageRequest } from '../PageRequest'
import type { PageResponse } from '../PageResponse'

export interface ListScansRequest extends PageRequest<'scanDate'> {
  fromScanDate?: Date | undefined
  toScanDate?: Date | undefined
}

export interface UnifiedScanResponse {
  source: 'DPS' | 'NOMIS'
  id: string
  prisonerNumber: string
  scanDate: Date | null
}

export interface ScanResponse extends UnifiedScanResponse {
  source: 'DPS'
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

export interface LegacyScanResponse extends UnifiedScanResponse {
  source: 'NOMIS'
  id: string
  prisonerNumber: string
  scanDate: Date | null
  scanDetails: string | null
}

export interface ScanSummaryRequest {
  includeAlerts?: boolean
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
  relevantAlerts: AlertResponse[] | null
  fromScanDate: Date
  toScanDate: Date
}

export interface ScanSummaryResponseWithoutAlerts extends ScanSummaryResponse {
  relevantAlerts: null
}

export interface ScanSummaryResponseWithAlerts extends ScanSummaryResponse {
  relevantAlerts: AlertResponse[]
}

export interface AlertResponse {
  id: string
  type: string
  typeDescription: string
  code: string
  codeDescription: string
}

export interface ErrorResponse {
  status: number
  errorCode?: string
  userMessage?: string
  developerMessage?: string
  moreInfo?: string
}

export interface XRayBodyScansApiClient {
  /**
   * Returns x-ray body scans recorded in DPS or NOMIS for the given prisoner.
   * If the prisoner is not found, the list is empty.
   * Ensure the prisoner exists prior to use.
   */
  listScans(
    prisonerNumber: string,
    request?: ListScansRequest,
  ): Promise<PageResponse<ScanResponse | LegacyScanResponse>>

  /**
   * Returns a summary of x-ray body scans for the given prisoner for this calendar year.
   * Optionally includes relevant alerts.
   * If the prisoner is not found, the counts will default to zero.
   */
  getScanSummary(
    prisonerNumber: string,
    request: ScanSummaryRequest & { includeAlerts: true },
  ): Promise<ScanSummaryResponseWithAlerts>
  getScanSummary(
    prisonerNumber: string,
    request: ScanSummaryRequest & { includeAlerts?: false },
  ): Promise<ScanSummaryResponseWithoutAlerts>
  getScanSummary(prisonerNumber: string, request?: ScanSummaryRequest): Promise<ScanSummaryResponse>
}
