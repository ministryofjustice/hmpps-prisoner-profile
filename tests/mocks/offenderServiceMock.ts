import Interface from './Interface'
import OffenderService from '../../server/services/offenderService'

export const offenderServiceMock = (): Interface<OffenderService> => ({
  getImage: jest.fn(),
  getPrisonerImage: jest.fn(),
  getPrisonerNonAssociationOverview: jest.fn(),
  getConfirmedReleaseDate: jest.fn(),
})

export default { offenderServiceMock }
