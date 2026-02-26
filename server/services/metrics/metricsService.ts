import { TelemetryClient } from 'applicationinsights'
import { PrisonUser } from '../../interfaces/HmppsUser'

export interface DuplicatePrisonerInfo {
  prisonerNumber: string
  prisonId: string
}

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

  trackPersonIntegrationUpdate<T = object>({
    prisonerNumber,
    fieldsUpdated,
    user,
    additionalProperties,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
    additionalProperties?: T
  }) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-person-integration-updated',
      properties: {
        prisonerNumber,
        fieldsUpdated,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
        ...additionalProperties,
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

  trackFrontendError(prisonerNumber: string, pageUrl: string, error: string, user: PrisonUser) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-frontend-error-shown',
      properties: {
        prisonerNumber,
        pageUrl,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
        error,
      },
    })
  }

  trackDuplicateRecordsFound(
    prisonerNumber: string,
    prisonId: string,
    duplicatesFound: DuplicatePrisonerInfo[],
    user: PrisonUser,
  ) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-duplicate-records-found',
      properties: {
        prisonerNumber,
        prisonId,
        duplicatesFound: JSON.stringify(duplicatesFound),
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackDuplicateRecordsGhostEstablishmentFiltered(
    prisonerNumber: string,
    prisonId: string,
    duplicatesRemoved: DuplicatePrisonerInfo[],
    user: PrisonUser,
  ) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-duplicate-records-ghost-establishment-filtered',
      properties: {
        prisonerNumber,
        prisonId,
        duplicatesRemoved: JSON.stringify(duplicatesRemoved),
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackDuplicateRecordsMultipleActiveFiltered(
    prisonerNumber: string,
    prisonId: string,
    duplicatesRemoved: DuplicatePrisonerInfo[],
    user: PrisonUser,
  ) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-duplicate-records-multiple-active-filtered',
      properties: {
        prisonerNumber,
        prisonId,
        duplicatesRemoved: JSON.stringify(duplicatesRemoved),
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }

  trackDuplicateRecordsApiFailure(prisonerNumber: string, prisonId: string, error: Error, user: PrisonUser) {
    this.telemetryClient?.trackEvent({
      name: 'prisoner-profile-duplicate-records-api-failure',
      properties: {
        prisonerNumber,
        prisonId,
        error: error.message,
        username: user.username,
        activeCaseLoad: user.activeCaseLoadId,
      },
    })
  }
}
