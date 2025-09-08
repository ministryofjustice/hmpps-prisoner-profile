import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import IncentivesService from './incentivesService'
import { incentiveReviewsMock } from '../data/localMockData/incentiveReviewsMock'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'
import { caseNotesApiClientMock } from '../../tests/mocks/caseNotesApiClientMock'

describe('prisonerScheduleService', () => {
  let caseNotesApiClient: CaseNotesApiClient
  let incentivesApiClient: IncentivesApiClient
  let service: IncentivesService

  beforeEach(() => {
    const caseNoteCount = {
      positiveBehaviourCount: 2,
      negativeBehaviourCount: 1,
    }
    caseNotesApiClient = caseNotesApiClientMock()
    caseNotesApiClient.getIncentivesCaseNoteCount = jest.fn().mockResolvedValue(caseNoteCount)
    incentivesApiClient = { getReviews: jest.fn() }
    service = new IncentivesService(
      () => caseNotesApiClient,
      () => incentivesApiClient,
    )
  })

  describe('incentiveSummary', () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-03'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should get data and map incentive summary data', async () => {
      incentivesApiClient.getReviews = jest.fn().mockResolvedValue(incentiveReviewsMock)
      const result = await service.getIncentiveOverview('token', 'A1234AB')

      expect(result).toEqual({
        daysOverdue: 2,
        negativeBehaviourCount: 1,
        nextReviewDate: '2024-01-01',
        positiveBehaviourCount: 2,
      })
    })

    it('should return null if no data', async () => {
      incentivesApiClient.getReviews = jest.fn().mockResolvedValue(null)

      const result = await service.getIncentiveOverview('token', 'A1234AB')
      expect(result).toEqual({
        daysOverdue: null,
        negativeBehaviourCount: null,
        nextReviewDate: null,
        positiveBehaviourCount: null,
      })
    })

    it('should return error object if api errors', async () => {
      incentivesApiClient.getReviews = jest.fn().mockRejectedValue('error')

      const result = await service.getIncentiveOverview('token', 'A1234AB')
      expect(result).toEqual({ error: true })
    })
  })
})
