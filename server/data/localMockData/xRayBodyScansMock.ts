import type { ScanCountResponse } from '../interfaces/xRayBodyScansApi'

export function mockScanCountResponse(prisonerNumber: string, nomisCount = 4, dpsCount = 2): ScanCountResponse {
  return {
    prisonerNumber,
    nomisCount: 0,
    dpsCount: 0,
    totalCount: nomisCount + dpsCount,
  }
}

export const scanCountResponseMock = mockScanCountResponse('G6123VU')
