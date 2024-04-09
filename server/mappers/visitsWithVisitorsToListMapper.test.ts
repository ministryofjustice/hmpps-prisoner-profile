import { addDays } from 'date-fns'
import { mockVisit, pagedVisitsMock } from '../data/localMockData/pagedVisitsWithVisitors'
import visitsWithVisitorsToListMapper from './visitsWithVisitorsToListMapper'

describe('visitsWithVisitorsToListMapper', () => {
  it('Maps visits with visitors into a formatted list', () => {
    const res = visitsWithVisitorsToListMapper(pagedVisitsMock.content)
    const first = res[0]
    expect(first.type).toEqual('Social visit')
    expect(first.dateAndTime).toEqual('20/04/2023 at 13:30 to 16:00')
    expect(first.status).toEqual('Not entered')
    expect(first.isBooked).toEqual(false)
    expect(first.prison).toEqual('Moorland (HMP & YOI)')
    expect(first.visitors).toEqual(['John Smith (Grandfather, 54 years old)'])
  })

  it('Marks visits as booked if they are in the future', () => {
    const visits = [
      mockVisit({ visitDetails: { eventStatus: 'SCH', startTime: addDays(new Date(), 10).toISOString() } }),
    ]
    const result = visitsWithVisitorsToListMapper(visits)
    expect(result[0].isBooked).toEqual(true)
  })

  describe('Displaying the correct status', () => {
    it('Calculates cancelled status', () => {
      const visits = [mockVisit({ visitDetails: { completionStatus: 'CANC', cancelReasonDescription: 'Reason' } })]
      const result = visitsWithVisitorsToListMapper(visits)

      expect(result[0].status).toEqual('Cancelled: Reason')
    })

    it('Calculates scheduled status when in the future', () => {
      const visits = [
        mockVisit({
          visitDetails: {
            completionStatus: 'SCH',
            searchTypeDescription: 'Desc',
            startTime: addDays(new Date(), 1).toISOString(),
          },
        }),
      ]
      const result = visitsWithVisitorsToListMapper(visits)
      expect(result[0].status).toEqual('Scheduled')
    })

    it('Calculates scheduled status when in the past', () => {
      const visits = [
        mockVisit({
          visitDetails: {
            completionStatus: 'SCH',
            searchTypeDescription: 'Desc',
            startTime: addDays(new Date(), -1).toISOString(),
          },
        }),
      ]
      const result = visitsWithVisitorsToListMapper(visits)

      expect(result[0].status).toEqual('Desc')
    })

    it('Calculates scheduled status when in the past and no description', () => {
      const visits = [
        mockVisit({
          visitDetails: {
            completionStatus: 'SCH',
            searchTypeDescription: '',
            startTime: addDays(new Date(), -1).toISOString(),
          },
        }),
      ]
      const result = visitsWithVisitorsToListMapper(visits)

      expect(result[0].status).toEqual('Not entered')
    })

    it('Defaults to the completion status and search type descriptions', () => {
      const visits = [
        mockVisit({
          visitDetails: {
            completionStatus: 'NORM',
            searchTypeDescription: 'Search desc',
            completionStatusDescription: 'Completion desc',
            startTime: addDays(new Date(), -1).toISOString(),
          },
        }),
      ]
      const result = visitsWithVisitorsToListMapper(visits)

      expect(result[0].status).toEqual('Completion desc: Search desc')
    })
  })
})
