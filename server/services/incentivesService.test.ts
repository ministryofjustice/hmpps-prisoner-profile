import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { IncentivesApiClient } from '../data/interfaces/incentivesApiClient'
import IncentivesService from './incentivesService'
import { incentiveDetailsDtoMock, incentiveReviewsWithDetailsMock } from '../data/localMockData/incentiveReviewsMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import StaffDetailsMock from '../data/localMockData/staffDetails'

describe('incentivesService', () => {
  let prisonApiClient: PrisonApiClient
  let incentivesApiClient: IncentivesApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(AgenciesMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)

    incentivesApiClient = {
      getReviewSummary: jest.fn().mockResolvedValue(incentiveReviewsWithDetailsMock),
    }
  })

  describe('getIncentiveReviewSummary', () => {
    it('should return incentive', async () => {
      const service = new IncentivesService(
        () => incentivesApiClient,
        () => prisonApiClient,
      )

      const response = await service.getIncentiveReviewSummary('token', 123456, true)

      expect(response).toEqual(incentiveDetailsDtoMock)
    })
  })
})
