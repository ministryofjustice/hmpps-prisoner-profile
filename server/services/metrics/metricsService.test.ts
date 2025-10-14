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
      const pageUrl = '/somePage'
      const apiUrlCalled = '/someApiUrl'
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

  describe('trackFrontendError', () => {
    it('should send correct telemetry event', () => {
      const prisonerNumber = 'A1234BC'
      const pageUrl = '/somePage'
      const error = 'Some Error'
      const user = { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser

      metricsService.trackFrontendError(prisonerNumber, pageUrl, error, user)

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-frontend-error-shown',
        properties: {
          prisonerNumber,
          pageUrl,
          error,
          username: user.username,
          activeCaseLoad: user.activeCaseLoadId,
        },
      })
    })
  })

  describe('trackPersonIntegrationUpdate', () => {
    it('should call telemetry client', async () => {
      metricsService.trackPersonIntegrationUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-person-integration-updated',
        properties: {
          prisonerNumber: 'A1234AA',
          fieldsUpdated: ['field1', 'field2'],
          username: 'USER1',
          activeCaseLoad: 'MDI',
        },
      })
    })

    it('should call telemetry client with additional properties', async () => {
      metricsService.trackPersonIntegrationUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
        additionalProperties: { example: 'property' },
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'prisoner-profile-person-integration-updated',
        properties: {
          prisonerNumber: 'A1234AA',
          fieldsUpdated: ['field1', 'field2'],
          username: 'USER1',
          activeCaseLoad: 'MDI',
          example: 'property',
        },
      })
    })
  })
})
