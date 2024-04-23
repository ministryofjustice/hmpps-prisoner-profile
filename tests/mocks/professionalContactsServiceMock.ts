import Interface from './Interface'
import ProfessionalContactsService from '../../server/services/professionalContactsService'

export const professionalContactsServiceMock = (): Interface<ProfessionalContactsService> => ({
  getContacts: jest.fn(),
  getProfessionalContactsOverview: jest.fn(),
})
