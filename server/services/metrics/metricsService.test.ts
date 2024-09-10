import { TelemetryClient } from 'applicationinsights'
import MetricsService from './metricsService'
import { PrisonUser } from '../../interfaces/HmppsUser'

jest.mock('applicationinsights')

describe('Metrics Service', () => {
  let telemetryClient: TelemetryClient
  let metricsService: MetricsService

  beforeEach(() => {
    telemetryClient = new TelemetryClient() as jest.Mocked<TelemetryClient>
    metricsService = new MetricsService(telemetryClient)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('trackPrisonPersonUpdate', () => {
    it('should call telemetry client', async () => {
      metricsService.trackPrisonPersonUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-prison-person-updated',
        properties: {
          prisonerNumber: 'A1234AA',
          fieldsUpdated: ['field1', 'field2'],
          username: 'USER1',
          activeCaseLoad: 'MDI',
        },
      })
    })
  })
})
