import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import PrisonerScheduleController from './prisonerScheduleController'
import { dataAccess } from '../data'
import { PrisonerScheduleThisWeekMock } from '../data/localMockData/prisonerScheduleMock'
import { getEventsNextWeekMock, getEventsThisWeekMock } from '../data/localMockData/getEventsMock'

describe('Prisoner schedule', () => {
  const offenderNo = 'ABC123'
  const prisonApi = {
    getDetails: jest.fn(),
    getScheduledEventsForThisWeek: jest.fn(),
    getScheduledEventsForNextWeek: jest.fn(),
  }

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

    prisonApi.getScheduledEventsForThisWeek = jest.fn().mockResolvedValue(getEventsThisWeekMock)
    prisonApi.getScheduledEventsForNextWeek = jest.fn().mockResolvedValue(getEventsNextWeekMock)
    controller = new PrisonerScheduleController(dataAccess.prisonApiClientBuilder)
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
