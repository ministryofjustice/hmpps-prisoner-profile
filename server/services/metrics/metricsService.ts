import { TelemetryClient } from 'applicationinsights'
import { PrisonUser } from '../../interfaces/HmppsUser'

export default class MetricsService {
  constructor(private readonly telemetryClient?: TelemetryClient) {}

  trackPrisonPersonUpdate({
    prisonerNumber,
    fieldsUpdated,
    user,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
  }) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-prison-person-updated',
      properties: {
        prisonerNumber,
        fieldsUpdated,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackPersonIntegrationUpdate({
    prisonerNumber,
    fieldsUpdated,
    user,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
  }) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-person-integration-updated',
      properties: {
        prisonerNumber,
        fieldsUpdated,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackHealthAndMedicationUpdate({
    prisonerNumber,
    fieldsUpdated,
    user,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
  }) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-health-and-medication-updated',
      properties: {
        prisonerNumber,
        fieldsUpdated,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackPersonCommunicationNeedsUpdate({
    prisonerNumber,
    fieldsUpdated,
    user,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
  }) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-person-communication-needs-updated',
      properties: {
        prisonerNumber,
        fieldsUpdated,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackPersonalRelationshipsUpdate({
    prisonerNumber,
    fieldsUpdated,
    user,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
  }) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-personal-relationships-updated',
      properties: {
        prisonerNumber,
        fieldsUpdated,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackNomisLockedWarning(prisonerNumber: string, pageUrl: string, apiUrlCalled: string, user: PrisonUser) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-nomis-locked-warning-shown',
      properties: {
        prisonerNumber,
        pageUrl,
        apiUrlCalled,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }
}
