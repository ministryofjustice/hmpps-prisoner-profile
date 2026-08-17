import type { XRayBodyScansApiClient } from '../../server/data/interfaces/xRayBodyScansApi'
import { emptyPageResponse } from '../../server/data/localMockData/pageResponse'
import { mockScanSummaryResponse } from '../../server/data/localMockData/xRayBodyScansMock'

export const xRayBodyScansApiClientMock = (): jest.Mocked<XRayBodyScansApiClient> => ({
  listScans: jest.fn((..._args) => Promise.resolve(emptyPageResponse())),
  getScanSummary: jest.fn((prisonerNumber: string) => Promise.resolve(mockScanSummaryResponse({ prisonerNumber }))),
})

export default { xRayBodyScansApiClientMock }
