import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApi/nonAssociationsApiClient'
import { nonAssociationsApiClientMock } from '../../tests/mocks/nonAssociationsApiClientMock'
import { prisonerNonAssociationsMock } from '../data/localMockData/prisonerNonAssociationsMock'
import OffenderService from './offenderService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import ServerError from '../utils/serverError'

describe('offenderService', () => {
  let nonAssociationsApi: NonAssociationsApiClient
  let prisonApi: PrisonApiClient

  beforeEach(() => {
    nonAssociationsApi = nonAssociationsApiClientMock()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getPrisonerNonAssociationOverview', () => {
    it('should get main offence and status', async () => {
      nonAssociationsApi.getPrisonerNonAssociations = jest.fn().mockResolvedValue(prisonerNonAssociationsMock)

      const offenderService = new OffenderService(
        () => prisonApi,
        () => nonAssociationsApi,
      )

      const result = await offenderService.getPrisonerNonAssociationOverview('token', 'prisonerNumber')

      expect(result).toEqual({
        prisonName: 'Moorland (HMP & YOI)',
        prisonCount: 1,
        otherPrisonsCount: 1,
      })
    })

    it('should get return error flag if API call fails', async () => {
      nonAssociationsApi.getPrisonerNonAssociations = jest.fn().mockRejectedValue(new ServerError())

      const offenderService = new OffenderService(
        () => prisonApi,
        () => nonAssociationsApi,
      )

      await expect(offenderService.getPrisonerNonAssociationOverview('token', 'prisonerNumber')).rejects.toThrow(
        'Server Error',
      )
    })
  })
})
