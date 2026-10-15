import Interface from './Interface'
import PrisonerPropertyService from '../../server/services/prisonerPropertyService'

export const prisonerPropertyServiceMock = (): Interface<PrisonerPropertyService> => ({
  getPropertySummary: jest.fn(),
  isPrisonActive: jest.fn(async () => true),
})

export default { prisonerPropertyServiceMock }
