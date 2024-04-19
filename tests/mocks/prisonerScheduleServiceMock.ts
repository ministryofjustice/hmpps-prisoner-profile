import PrisonerScheduleService from '../../server/services/prisonerScheduleService'
import Interface from './Interface'

export const prisonerScheduleServiceMock = (): Interface<PrisonerScheduleService> => ({
  getScheduleOverview: jest.fn(),
})
