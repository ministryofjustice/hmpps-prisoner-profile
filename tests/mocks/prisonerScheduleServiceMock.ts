import PrisonerScheduleService from '../../server/services/prisonerScheduleService'
import Interface from './Interface'

export const prisonerScheduleServiceMock = (): Interface<PrisonerScheduleService> => ({
  getScheduleOverview: jest.fn(),
  getScheduledTransfers: jest.fn(),
})

export default { prisonerScheduleServiceMock }
