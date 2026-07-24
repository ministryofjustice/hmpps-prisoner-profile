import { startOfToday, startOfYear } from 'date-fns'
import type { ScanSummaryResponse } from '../interfaces/xRayBodyScansApi'

export function mockScanSummaryResponse(prisonerNumber: string, nomisCount = 4, dpsCount = 2): ScanSummaryResponse {
  const today = startOfToday()
  return {
    prisonerNumber,
    nomisCount: 0,
    dpsCount: 0,
    totalCount: nomisCount + dpsCount,
    positiveCount: 0,
    negativeCount: 0,
    inconclusiveCount: 0,
    remainingScans: 116 - (nomisCount + dpsCount),
    fromScanDate: startOfYear(today),
    toScanDate: today,
  }
}

export const scanSummaryResponseMock = mockScanSummaryResponse('G6123VU')
