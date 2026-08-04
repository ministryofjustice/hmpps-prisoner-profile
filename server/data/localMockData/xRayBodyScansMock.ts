import { startOfToday, startOfYear, subDays } from 'date-fns'
import type {
  AlertResponse,
  ScanResponse,
  ScanSummaryResponse,
  ScanSummaryResponseWithAlerts,
  ScanSummaryResponseWithoutAlerts,
} from '../interfaces/xRayBodyScansApi'

const sampleId = '019f94a7-17cd-746f-b1df-5d4848da42e1'
const today = startOfToday()

export function mockScanResponse(
  prisonerNumber: string,
  scanDate: Date = subDays(today, 1),
  prisonId = 'MDI',
  createdBy = 'abc12a',
): ScanResponse {
  return {
    id: sampleId,
    prisonerNumber,
    prisonId,
    scanDate,
    justification: 'REASONABLE_SUSPICION',
    justificationDescription: 'Reasonable suspicion',
    outcome: 'POSITIVE',
    outcomeDescription: 'Item detected',
    typeOfFind: 'INORGANIC',
    typeOfFindDescription: 'Inorganic',
    caseNoteId: null,
    mergedAt: null,
    mergedFromPrisonerNumber: null,
    createdAt: new Date(),
    createdBy,
    lastModifiedAt: new Date(),
    lastModifiedBy: createdBy,
  }
}

export const annualLimit = 116
export const nearingLimitThreshold = 100

interface ScanSummaryMockOptions {
  prisonerNumber: string
  nomisCount?: number
  dpsCount?: number
  positiveCount?: number
  negativeCount?: number
  inconclusiveCount?: number
  relevantAlerts?: AlertResponse[] | null
}

export function mockScanSummaryResponse(
  options: ScanSummaryMockOptions & { relevantAlerts: AlertResponse[] },
): ScanSummaryResponseWithAlerts
export function mockScanSummaryResponse(
  options: ScanSummaryMockOptions & { relevantAlerts?: null },
): ScanSummaryResponseWithoutAlerts
export function mockScanSummaryResponse(options: ScanSummaryMockOptions): ScanSummaryResponse
export function mockScanSummaryResponse({
  prisonerNumber,
  nomisCount = 0,
  dpsCount = 0,
  positiveCount = 0,
  negativeCount = 0,
  inconclusiveCount = 0,
  relevantAlerts = null,
}: ScanSummaryMockOptions): ScanSummaryResponse {
  const totalCount = nomisCount + dpsCount
  const remainingScans = annualLimit - totalCount
  const nearingScanLimit = totalCount >= nearingLimitThreshold
  const atScanLimit = remainingScans <= 0
  return {
    prisonerNumber,
    nomisCount,
    dpsCount,
    totalCount,
    positiveCount,
    negativeCount,
    inconclusiveCount,
    annualLimit,
    remainingScans,
    nearingScanLimit,
    atScanLimit,
    relevantAlerts,
    fromScanDate: startOfYear(today),
    toScanDate: today,
  }
}
