import type { XRayBodyScansApiClient } from '../../server/data/interfaces/xRayBodyScansApi'

export const xRayBodyScansApiClientMock = (): jest.Mocked<XRayBodyScansApiClient> => ({
  getScanSummary: jest.fn(),
})

export default { xRayBodyScansApiClientMock }
