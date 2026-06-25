import type { XRayBodyScansApiClient } from '../../server/data/interfaces/xRayBodyScansApi'

export const xRayBodyScansApiClientMock = (): XRayBodyScansApiClient => ({
  countScans: jest.fn(),
})

export default { xRayBodyScansApiClientMock }
