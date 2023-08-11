import { Prisoner } from '../interfaces/prisoner'
import ActivePunishmentsService from './activePunishmentsService'
import { adjudicationSummaryWithActiveMock } from '../data/localMockData/miniSummaryMock'
import { AdjudicationsApiClient } from '../data/interfaces/adjudicationsApiClient'
import { adjudicationsApiClientMock } from '../../tests/mocks/adjudicationsApiClientMock'

describe('ActivePunishmentsPageService', () => {
  let adjudicationsApiClient: AdjudicationsApiClient

  const activePunishmentsPageServiceConstruct = jest.fn(() => {
    return new ActivePunishmentsService(() => adjudicationsApiClient)
  })

  beforeEach(() => {
    adjudicationsApiClient = adjudicationsApiClientMock()
    adjudicationsApiClient.getAdjudications = jest.fn(async () => adjudicationSummaryWithActiveMock)
  })

  describe('Active Punishments Page', () => {
    it('Get all data for the active punishments page', async () => {
      const activePunishmentsPageService = activePunishmentsPageServiceConstruct()
      const res = await activePunishmentsPageService.get('token', {
        prisonerNumber: 'G6123VU',
        bookingId: 1102484,
      } as Prisoner)
      expect(res).toEqual({ adjudications: adjudicationSummaryWithActiveMock, name: '' })
    })
  })
})
