import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApi/nonAssociationsApiClient'
import { nonAssociationsApiClientMock } from '../../tests/mocks/nonAssociationsApiClientMock'
import { prisonerNonAssociationsMock } from '../data/localMockData/prisonerNonAssociationsMock'
import OffenderService from './offenderService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import ServerError from '../utils/serverError'

describe('offenderService', () => {
  let nonAssociationsApi: NonAssociationsApiClient
  let prisonApi: PrisonApiClient

  beforeEach(() => {
    nonAssociationsApi = nonAssociationsApiClientMock()
    prisonApi = prisonApiClientMock()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getConfirmedReleaseDate', () => {
    it('should return the confirmed release date from sentence details', async () => {
      prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
        sentenceDetail: { confirmedReleaseDate: '2026-02-07' },
      })

      const offenderService = new OffenderService(
        () => prisonApi,
        () => nonAssociationsApi,
      )

      const result = await offenderService.getConfirmedReleaseDate('token', 'A1234BC')

      expect(result).toEqual('2026-02-07')
      expect(prisonApi.getPrisonerSentenceDetails).toHaveBeenCalledWith('A1234BC')
    })

    it('should return undefined when no confirmed release date is set', async () => {
      prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
        sentenceDetail: {},
      })

      const offenderService = new OffenderService(
        () => prisonApi,
        () => nonAssociationsApi,
      )

      const result = await offenderService.getConfirmedReleaseDate('token', 'A1234BC')

      expect(result).toBeUndefined()
    })
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
