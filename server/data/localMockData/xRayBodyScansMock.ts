import { startOfToday, startOfYear, subDays } from 'date-fns'
import type { ScanResponse, ScanSummaryResponse } from '../interfaces/xRayBodyScansApi'

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

export const scanResponseMock = mockScanResponse('G6123VU', new Date(2026, 6, 20, 12))

export function mockScanSummaryResponse(prisonerNumber: string, nomisCount = 4, dpsCount = 2): ScanSummaryResponse {
  const annualLimit = 116
  const totalCount = nomisCount + dpsCount
  return {
    prisonerNumber,
    nomisCount: 0,
    dpsCount: 0,
    totalCount,
    positiveCount: 0,
    negativeCount: 0,
    inconclusiveCount: 0,
    annualLimit,
    remainingScans: annualLimit - totalCount,
    fromScanDate: startOfYear(today),
    toScanDate: today,
  }
}

export const scanSummaryResponseMock = mockScanSummaryResponse('G6123VU')
