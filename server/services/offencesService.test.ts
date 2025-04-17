import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import OffencesService from './offencesService'
import { calculateReleaseDatesApiClientMock } from '../../tests/mocks/calculateReleaseDatesApiClientMock'
import CalculateReleaseDatesApiClient from '../data/interfaces/calculateReleaseDatesApi/calculateReleaseDatesApiClient'
import { latestCalculation, latestCalculationWithNomisSource } from '../data/localMockData/latestCalculationMock'
import { fullStatusMock } from '../data/localMockData/offenceOverviewMock'

jest.mock('../data/prisonApiClient')

describe('offencesService', () => {
  let prisonApiClientSpy: PrisonApiClient
  let calculateReleaseDatesApiClientSpy: CalculateReleaseDatesApiClient

  beforeEach(() => {
    prisonApiClientSpy = prisonApiClientMock()
    calculateReleaseDatesApiClientSpy = calculateReleaseDatesApiClientMock()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getNextCourtAppearanceSummary', () => {
    it('should return the next court appearance summary', async () => {
      prisonApiClientSpy.getNextCourtEvent = jest.fn().mockResolvedValue({
        caseReference: 'caseReference',
        courtLocation: 'courtLocation',
        courtEventType: 'courtEventType',
        startTime: '2021-01-01T00:00:00',
      })

      const offencesService = new OffencesService(
        () => prisonApiClientSpy,
        () => calculateReleaseDatesApiClientSpy,
      )

      const result = await offencesService.getNextCourtHearingSummary('token', 1)

      expect(result).toEqual({
        caseReference: 'caseReference',
        location: 'courtLocation',
        hearingType: 'courtEventType',
        date: '2021-01-01T00:00:00',
      })
    })

    it('should return null if there is no next court appearance', async () => {
      prisonApiClientSpy.getNextCourtEvent = jest.fn().mockResolvedValue({})

      const offencesService = new OffencesService(
        () => prisonApiClientSpy,
        () => calculateReleaseDatesApiClientSpy,
      )

      const result = await offencesService.getNextCourtHearingSummary('token', 1)

      expect(result).toBeNull()
    })
  })

  describe('getActiveCourtCasesCount', () => {
    it('should return the active court cases count', async () => {
      prisonApiClientSpy.getActiveCourtCasesCount = jest.fn().mockResolvedValue(1)

      const offencesService = new OffencesService(
        () => prisonApiClientSpy,
        () => calculateReleaseDatesApiClientSpy,
      )

      const result = await offencesService.getActiveCourtCasesCount('token', 1)

      expect(result).toEqual(1)
    })
  })

  describe('getLatestReleaseCalculation', () => {
    it('should return the response mapped to LatestCalculationSummary', async () => {
      calculateReleaseDatesApiClientSpy.getLatestCalculation = jest.fn().mockResolvedValue(latestCalculation)
      const offencesService = new OffencesService(
        () => prisonApiClientSpy,
        () => calculateReleaseDatesApiClientSpy,
      )

      const result = await offencesService.getLatestReleaseCalculation('token', 'prisonNumber')
      expect(result).toEqual({
        calculationDate: '2024-03-07T15:16:14',
        establishment: 'Kirkham (HMP)',
        reason: 'Correcting an earlier sentence',
      })
    })

    it('should return null for establishment if source is NOMIS', async () => {
      calculateReleaseDatesApiClientSpy.getLatestCalculation = jest
        .fn()
        .mockResolvedValue(latestCalculationWithNomisSource)
      const offencesService = new OffencesService(
        () => prisonApiClientSpy,
        () => calculateReleaseDatesApiClientSpy,
      )

      const result = await offencesService.getLatestReleaseCalculation('token', 'prisonNumber')
      expect(result).toEqual({
        calculationDate: '2024-03-07T15:16:14',
        establishment: null,
        reason: 'Correcting an earlier sentence',
      })
    })
  })

  describe('getOffencesOverview', () => {
    it('should get main offence and status', async () => {
      prisonApiClientSpy.getMainOffence = jest.fn().mockResolvedValue([{ offenceDescription: 'description' }])
      prisonApiClientSpy.getFullStatus = jest.fn().mockResolvedValue(fullStatusMock)

      const offencesService = new OffencesService(
        () => prisonApiClientSpy,
        () => calculateReleaseDatesApiClientSpy,
      )

      const result = await offencesService.getOffencesOverview('token', 1, 'prisonerNumber')

      expect(result).toEqual({
        mainOffenceDescription: 'description',
        fullStatus: fullStatusMock,
      })
    })
  })
})
