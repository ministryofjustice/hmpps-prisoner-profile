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

  describe('trackHealthAndMedicationsUpdate', () => {
    it('should call telemetry client', async () => {
      metricsService.trackHealthAndMedicationUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-health-and-medication-updated',
        properties: {
          prisonerNumber: 'A1234AA',
          fieldsUpdated: ['field1', 'field2'],
          username: 'USER1',
          activeCaseLoad: 'MDI',
        },
      })
    })
  })

  describe('trackPersonCommunicationNeedsUpdate', () => {
    it('should call telemetry client', async () => {
      metricsService.trackPersonCommunicationNeedsUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-person-communication-needs-updated',
        properties: {
          prisonerNumber: 'A1234AA',
          fieldsUpdated: ['field1', 'field2'],
          username: 'USER1',
          activeCaseLoad: 'MDI',
        },
      })
    })
  })

  describe('trackPersonalRelationshipsUpdate', () => {
    it('should call telemetry client', async () => {
      metricsService.trackPersonalRelationshipsUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-personal-relationships-updated',
        properties: {
          prisonerNumber: 'A1234AA',
          fieldsUpdated: ['field1', 'field2'],
          username: 'USER1',
          activeCaseLoad: 'MDI',
        },
      })
    })
  })

  describe('trackNomisLockedWarning', () => {
    it('should send correct telemetry event', () => {
      const prisonerNumber = 'A1234BC'
      const pageUrl = '/prisoner/A1234BC/profile'
      const apiUrlCalled = '/api/prisoner/A1234BC/lock-status'
      const user = { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser

      metricsService.trackNomisLockedWarning(prisonerNumber, pageUrl, apiUrlCalled, user)

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-nomis-locked-warning-shown',
        properties: {
          prisonerNumber,
          pageUrl,
          apiUrlCalled,
          username: user.username,
          activeCaseLoad: user.activeCaseLoadId,
        },
      })
    })
  })
})
