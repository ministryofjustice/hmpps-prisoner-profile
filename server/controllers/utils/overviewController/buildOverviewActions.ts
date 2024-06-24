import type HeaderFooterMeta from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterMeta'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import HmppsAction from '../../interfaces/HmppsAction'
import { Icon } from '../../../data/enums/icon'
import { includesActiveCaseLoad } from '../../../utils/utils'
import conf from '../../../config'
import isServiceNavEnabled from '../../../utils/isServiceEnabled'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import { Permissions } from '../../../services/permissionsService'
import Nominal from '../../../data/interfaces/manageSocCasesApi/Nominal'

export default (
  prisonerData: Prisoner,
  pathfinderNominal: Nominal | null,
  socNominal: Nominal | null,
  user: HmppsUser,
  config: typeof conf,
  feComponentsMeta: HeaderFooterMeta | undefined,
  permissions: Permissions,
): HmppsAction[] => {
  const actions: HmppsAction[] = []
  const addAppointmentUrl = config.featureToggles.profileAddAppointmentEnabled
    ? `/prisoner/${prisonerData.prisonerNumber}/add-appointment`
    : `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/add-appointment`

  if (!config.featureToggles.courCasesSummaryEnabled && permissions.calculateReleaseDates?.edit) {
    actions.push({
      text: 'Calculate release dates',
      icon: Icon.CalculateReleaseDates,
      url: `${config.serviceUrls.calculateReleaseDates}/?prisonId=${prisonerData.prisonerNumber}`,
      dataQA: 'calculate-release-dates-action-link',
    })
  }

  if (permissions.caseNotes?.edit) {
    actions.push({
      text: 'Add case note',
      icon: Icon.AddCaseNote,
      url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
      dataQA: 'add-case-note-action-link',
    })
  }

  if (permissions.keyWorker?.edit) {
    actions.push({
      text: 'Add key worker session',
      icon: Icon.AddKeyWorkerSession,
      url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note?type=KA&subType=KS`,
      dataQA: 'add-key-worker-session-action-link',
    })
  }

  if (permissions.appointment?.edit) {
    actions.push({
      text: 'Add appointment',
      icon: Icon.AddAppointment,
      url: addAppointmentUrl,
      dataQA: 'add-appointment-action-link',
    })
  }

  if (permissions.useOfForce?.edit && !includesActiveCaseLoad(config.featureToggles.useOfForceDisabledPrisons, user)) {
    actions.push({
      text: 'Report use of force',
      icon: Icon.ReportUseOfForce,
      url: `${config.serviceUrls.useOfForce}/report/${prisonerData.bookingId}/report-use-of-force`,
      dataQA: 'report-use-of-force-action-link',
    })
  }

  if (permissions.activity?.edit && isServiceNavEnabled('activities', feComponentsMeta)) {
    actions.push({
      text: 'Log an activity application',
      icon: Icon.LogActivityApplication,
      url: `${config.serviceUrls.activities}/waitlist/${prisonerData.prisonerNumber}/apply`,
      dataQA: 'log-an-activity-application-link',
    })
  }

  if (permissions.pathfinder?.edit && !pathfinderNominal) {
    actions.push({
      text: 'Refer to Pathfinder',
      icon: Icon.ReferToPathfinder,
      url: `${config.serviceUrls.pathfinder}/refer/offender/${prisonerData.prisonerNumber}`,
      dataQA: 'refer-to-pathfinder-action-link',
    })
  }

  if (permissions.soc?.edit && !socNominal) {
    actions.push({
      text: 'Add to SOC',
      icon: Icon.AddToSOC,
      url: `${config.serviceUrls.manageSocCases}/refer/offender/${prisonerData.prisonerNumber}`,
      dataQA: 'add-to-soc-action-link',
    })
  }

  if (permissions.offenderCategorisation?.edit) {
    actions.push({
      text: 'Manage category',
      icon: Icon.ManageCategory,
      url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
      dataQA: 'manage-category-action-link',
    })
  }

  return actions
}
