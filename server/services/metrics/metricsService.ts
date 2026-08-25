import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { PrisonUser } from '../../interfaces/HmppsUser'

export interface DuplicatePrisonerInfo {
  prisonerNumber: string
  prisonId: string
}

export default class MetricsService {
  trackPrisonPersonUpdate({
    prisonerNumber,
    fieldsUpdated,
    user,
  }: {
    prisonerNumber: string
    fieldsUpdated: string[]
    user: PrisonUser
  }) {
    telemetry.trackEvent('prisoner-profile-prison-person-updated', {
      prisonerNumber,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
      fieldsUpdated: JSON.stringify(fieldsUpdated),
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
    telemetry.trackEvent('prisoner-profile-person-integration-updated', {
      prisonerNumber,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
      fieldsUpdated: JSON.stringify(fieldsUpdated),
      ...additionalProperties,
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
    telemetry.trackEvent('prisoner-profile-health-and-medication-updated', {
      prisonerNumber,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
      fieldsUpdated: JSON.stringify(fieldsUpdated),
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
    telemetry.trackEvent('prisoner-profile-person-communication-needs-updated', {
      prisonerNumber,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
      fieldsUpdated: JSON.stringify(fieldsUpdated),
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
    telemetry.trackEvent('prisoner-profile-personal-relationships-updated', {
      prisonerNumber,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
      fieldsUpdated: JSON.stringify(fieldsUpdated),
    })
  }

  trackNomisLockedWarning(prisonerNumber: string, pageUrl: string, apiUrlCalled: string, user: PrisonUser) {
    telemetry.trackEvent('prisoner-profile-nomis-locked-warning-shown', {
      prisonerNumber,
      pageUrl,
      apiUrlCalled,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
    })
  }

  trackFrontendError(prisonerNumber: string, pageUrl: string, error: string, user: PrisonUser) {
    telemetry.trackEvent('prisoner-profile-frontend-error-shown', {
      prisonerNumber,
      pageUrl,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
      error,
    })
  }

  trackDuplicateRecordsFound(
    prisonerNumber: string,
    prisonId: string,
    duplicatesFound: DuplicatePrisonerInfo[],
    user: PrisonUser,
  ) {
    telemetry.trackEvent('prisoner-profile-duplicate-records-found', {
      prisonerNumber,
      prisonId,
      duplicatesFound: JSON.stringify(duplicatesFound),
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
    })
  }

  trackDuplicateRecordsGhostEstablishmentFiltered(
    prisonerNumber: string,
    prisonId: string,
    duplicatesRemoved: DuplicatePrisonerInfo[],
    user: PrisonUser,
  ) {
    telemetry.trackEvent('prisoner-profile-duplicate-records-ghost-establishment-filtered', {
      prisonerNumber,
      prisonId,
      duplicatesRemoved: JSON.stringify(duplicatesRemoved),
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
    })
  }

  trackDuplicateRecordsMultipleActiveFiltered(
    prisonerNumber: string,
    prisonId: string,
    duplicatesRemoved: DuplicatePrisonerInfo[],
    user: PrisonUser,
  ) {
    telemetry.trackEvent('prisoner-profile-duplicate-records-multiple-active-filtered', {
      prisonerNumber,
      prisonId,
      duplicatesRemoved: JSON.stringify(duplicatesRemoved),
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
    })
  }

  trackDuplicateRecordsApiFailure(prisonerNumber: string, prisonId: string, error: Error, user: PrisonUser) {
    telemetry.trackEvent('prisoner-profile-duplicate-records-api-failure', {
      prisonerNumber,
      prisonId,
      error: error.message,
      username: user.username,
      activeCaseLoad: user.activeCaseLoadId,
    })
  }
}
