import CareNeedsService from '../../server/services/careNeedsService'
import Interface from './Interface'

export const careNeedsServiceMock = (): jest.Mocked<Interface<CareNeedsService>> => ({
  getCareNeedsAndAdjustments: jest.fn(),
  getXrayBodyScanSummary: jest.fn(),
})

export default { careNeedsServiceMock }
