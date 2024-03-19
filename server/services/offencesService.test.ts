import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import OffencesService from './offencesService'

jest.mock('../data/prisonApiClient')

describe('offencesService', () => {
  let prisonApiClientSpy: PrisonApiClient

  beforeEach(() => {
    prisonApiClientSpy = prisonApiClientMock()
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

      const offencesService = new OffencesService(() => prisonApiClientSpy)

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

      const offencesService = new OffencesService(() => prisonApiClientSpy)

      const result = await offencesService.getNextCourtHearingSummary('token', 1)

      expect(result).toBeNull()
    })
  })

  describe('getActiveCourtCasesCount', () => {
    it('should return the active court cases count', async () => {
      prisonApiClientSpy.getActiveCourtCasesCount = jest.fn().mockResolvedValue(1)

      const offencesService = new OffencesService(() => prisonApiClientSpy)

      const result = await offencesService.getActiveCourtCasesCount('token', 1)

      expect(result).toEqual(1)
    })
  })
})
