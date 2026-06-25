import type { XRayBodyScansApiClient } from '../../server/data/interfaces/xRayBodyScansApi'

export const xRayBodyScansApiClientMock = (): jest.Mocked<XRayBodyScansApiClient> => ({
  countScans: jest.fn(),
})

export default { xRayBodyScansApiClientMock }
