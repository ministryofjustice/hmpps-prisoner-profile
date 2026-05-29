import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import MetricsService from './metricsService'
import { PrisonUser } from '../../interfaces/HmppsUser'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => ({
  telemetry: {
    trackEvent: jest.fn(),
  },
}))

describe('Metrics Service', () => {
  let metricsService: MetricsService
  const trackEventMock = telemetry.trackEvent as jest.Mock

  beforeEach(() => {
    metricsService = new MetricsService()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('trackPrisonPersonUpdate', () => {
    it('should call telemetry', () => {
      metricsService.trackPrisonPersonUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-prison-person-updated', {
        prisonerNumber: 'A1234AA',
        fieldsUpdated: JSON.stringify(['field1', 'field2']),
        username: 'USER1',
        activeCaseLoad: 'MDI',
      })
    })
  })

  describe('trackHealthAndMedicationsUpdate', () => {
    it('should call telemetry', () => {
      metricsService.trackHealthAndMedicationUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-health-and-medication-updated', {
        prisonerNumber: 'A1234AA',
        fieldsUpdated: JSON.stringify(['field1', 'field2']),
        username: 'USER1',
        activeCaseLoad: 'MDI',
      })
    })
  })

  describe('trackPersonCommunicationNeedsUpdate', () => {
    it('should call telemetry', () => {
      metricsService.trackPersonCommunicationNeedsUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-person-communication-needs-updated', {
        prisonerNumber: 'A1234AA',
        fieldsUpdated: JSON.stringify(['field1', 'field2']),
        username: 'USER1',
        activeCaseLoad: 'MDI',
      })
    })
  })

  describe('trackPersonalRelationshipsUpdate', () => {
    it('should call telemetry', () => {
      metricsService.trackPersonalRelationshipsUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-personal-relationships-updated', {
        prisonerNumber: 'A1234AA',
        fieldsUpdated: JSON.stringify(['field1', 'field2']),
        username: 'USER1',
        activeCaseLoad: 'MDI',
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

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-nomis-locked-warning-shown', {
        prisonerNumber,
        pageUrl,
        apiUrlCalled,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
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

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-frontend-error-shown', {
        prisonerNumber,
        pageUrl,
        error,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      })
    })
  })

  describe('trackPersonIntegrationUpdate', () => {
    it('should call telemetry', () => {
      metricsService.trackPersonIntegrationUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
      })

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-person-integration-updated', {
        prisonerNumber: 'A1234AA',
        fieldsUpdated: JSON.stringify(['field1', 'field2']),
        username: 'USER1',
        activeCaseLoad: 'MDI',
      })
    })

    it('should call telemetry with additional properties', () => {
      metricsService.trackPersonIntegrationUpdate({
        fieldsUpdated: ['field1', 'field2'],
        prisonerNumber: 'A1234AA',
        user: { username: 'USER1', activeCaseLoadId: 'MDI' } as PrisonUser,
        additionalProperties: { example: 'property' },
      })

      expect(trackEventMock).toHaveBeenCalledWith('prisoner-profile-person-integration-updated', {
        prisonerNumber: 'A1234AA',
        fieldsUpdated: JSON.stringify(['field1', 'field2']),
        username: 'USER1',
        activeCaseLoad: 'MDI',
        example: 'property',
      })
    })
  })
})
