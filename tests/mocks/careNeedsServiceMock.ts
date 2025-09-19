import CareNeedsService from '../../server/services/careNeedsService'
import Interface from './Interface'

export const careNeedsServiceMock = (): Interface<CareNeedsService> => ({
  getCareNeedsAndAdjustments: jest.fn(),
  getXrayBodyScans: jest.fn(),
  getXrayBodyScanSummary: jest.fn(),
})

export default { careNeedsServiceMock }
