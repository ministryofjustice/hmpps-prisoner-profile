import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import PrisonerScheduleService from './prisonerScheduleService'
import dummyScheduledEvents from '../data/localMockData/eventsForToday'

describe('prisonerScheduleService', () => {
  let prisonApiClient: PrisonApiClient
  let service: PrisonerScheduleService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    service = new PrisonerScheduleService(() => prisonApiClient)
  })
  describe('getScheduleOverview', () => {
    it('Groups the events', async () => {
      prisonApiClient.getEventsScheduledForToday = jest.fn().mockResolvedValue(dummyScheduledEvents)

      const schedule = await service.getScheduleOverview('token', 1)
      const { morning, afternoon, evening } = schedule
      expect(morning.length).toEqual(1)
      expect(afternoon.length).toEqual(1)
      expect(evening.length).toEqual(2)
    })

    it('Uses the event source description for PA sub types', async () => {
      const events = [{ ...dummyScheduledEvents[0], eventSubType: 'PA', eventSourceDesc: 'The event description' }]

      prisonApiClient.getEventsScheduledForToday = jest.fn(async () => events)
      const schedule = await service.getScheduleOverview('token', 1)
      const { morning } = schedule
      expect(morning[0].name).toEqual('The event description')
    })

    it('Creates the overview page schedule from the events', async () => {
      prisonApiClient.getEventsScheduledForToday = jest.fn().mockResolvedValue(dummyScheduledEvents)

      const { morning, afternoon, evening } = await service.getScheduleOverview('token', 1)

      expect(morning[0].name).toEqual('Joinery AM')
      expect(morning[0].startTime).toEqual('08:30')

      expect(afternoon[0].name).toEqual('Joinery PM')
      expect(afternoon[0].startTime).toEqual('13:15')
      expect(afternoon[0].endTime).toEqual('16:15')

      expect(evening[0].name).toEqual('Gym - Football')
      expect(evening[0].startTime).toEqual('18:00')
      expect(evening[0].endTime).toEqual('19:00')
      expect(evening[1].name).toEqual('VLB - Test')
      expect(evening[1].startTime).toEqual('18:00')
      expect(evening[1].endTime).toEqual('19:00')
    })
  })
})
