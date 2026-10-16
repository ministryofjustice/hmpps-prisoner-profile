import Interface from './Interface'
import PrisonerPropertyService from '../../server/services/prisonerPropertyService'

export const prisonerPropertyServiceMock = (): Interface<PrisonerPropertyService> => ({
  getPropertySummary: jest.fn(),
})

export default { prisonerPropertyServiceMock }
