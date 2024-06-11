import Interface from './Interface'
import PersonalPageService from '../../server/services/personalPageService'

export const personalPageServiceMock = (): Interface<PersonalPageService> => ({
  get: jest.fn(),
  getLearnerNeurodivergence: jest.fn(),
  getPrisonPerson: jest.fn(),
})
