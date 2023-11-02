import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import PrisonerScheduleController from './prisonerScheduleController'
import { PrisonerScheduleThisWeekMock } from '../data/localMockData/prisonerScheduleMock'
import { getEventsNextWeekMock, getEventsThisWeekMock } from '../data/localMockData/getEventsMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'

describe('Prisoner schedule', () => {
  const offenderNo = 'ABC123'
  let prisonApi: PrisonApiClient

  let req: any
  let res: any
  let controller: PrisonerScheduleController

  beforeEach(() => {
    req = {
      middleware: {
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    prisonApi = prisonApiClientMock()
    prisonApi.getScheduledEventsForThisWeek = jest.fn().mockResolvedValue(getEventsThisWeekMock)
    prisonApi.getScheduledEventsForNextWeek = jest.fn().mockResolvedValue(getEventsNextWeekMock)
    controller = new PrisonerScheduleController(() => prisonApi)
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('when visiting the page with no query', () => {
    describe('without data', () => {
      it('should render the template with the correct days of the week', async () => {
        await controller.displayPrisonerSchedule(req, res, PrisonerMockDataA)
        expect(res.render).toHaveBeenCalledWith('pages/prisonerSchedule', PrisonerScheduleThisWeekMock)
      })
    })
  })
})
