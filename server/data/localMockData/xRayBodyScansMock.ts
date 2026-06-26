import { startOfToday, startOfYear } from 'date-fns'
import type { ScanCountResponse } from '../interfaces/xRayBodyScansApi'

export function mockScanCountResponse(prisonerNumber: string, nomisCount = 4, dpsCount = 2): ScanCountResponse {
  const today = startOfToday()
  return {
    prisonerNumber,
    nomisCount: 0,
    dpsCount: 0,
    totalCount: nomisCount + dpsCount,
    fromScanDate: startOfYear(today),
    toScanDate: today,
  }
}

export const scanCountResponseMock = mockScanCountResponse('G6123VU')
