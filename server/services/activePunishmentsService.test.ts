import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import ActivePunishmentsService from './activePunishmentsService'
import { adjudicationSummaryWithActiveMock } from '../data/localMockData/miniSummaryMock'

describe('ActivePunishmentsPageService', () => {
  let prisonApiClient: PrisonApiClient

  const activePunishmentsPageServiceConstruct = jest.fn(() => {
    return new ActivePunishmentsService(() => prisonApiClient)
  })

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAdjudications = jest.fn(async () => adjudicationSummaryWithActiveMock)
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
