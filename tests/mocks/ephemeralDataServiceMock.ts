import EphemeralDataService from '../../server/services/ephemeralDataService'
import Interface from './Interface'

export const ephemeralDataServiceMock = (): Interface<EphemeralDataService> => ({
  cacheData: jest.fn(),
  getData: jest.fn(),
  removeData: jest.fn(),
})

export default { ephemeralDataServiceMock }
