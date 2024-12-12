import Interface from './Interface'
import CsipService from '../../server/services/csipService'

export const csipServiceMock = (): Interface<CsipService> => ({
  getCurrentCsip: jest.fn(),
})
