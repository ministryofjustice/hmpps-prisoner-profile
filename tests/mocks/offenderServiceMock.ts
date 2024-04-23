import Interface from './Interface'
import OffenderService from '../../server/services/offenderService'

export const offenderServiceMock = (): Interface<OffenderService> => ({
  getPrisoner: jest.fn(),
  getImage: jest.fn(),
  getPrisonerImage: jest.fn(),
  getPrisonerNonAssociationOverview: jest.fn(),
})
