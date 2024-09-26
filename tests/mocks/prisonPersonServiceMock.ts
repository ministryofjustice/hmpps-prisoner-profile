import Interface from './Interface'
import PrisonPersonService from '../../server/services/prisonPersonService'

export const prisonPersonServiceMock = (): Interface<PrisonPersonService> => ({
  getFieldHistory: jest.fn(),
})
