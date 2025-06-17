import EphemeralDataService from '../../server/services/EphemeralDataService'
import Interface from './Interface'

export const ephemeralDataServiceMock = (): Interface<EphemeralDataService> => ({
  cacheData: jest.fn(),
  getData: jest.fn(),
  removeData: jest.fn(),
})
