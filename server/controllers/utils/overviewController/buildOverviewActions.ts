import type HeaderFooterSharedData from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterSharedData'
import {
  CaseNotesPermission,
  isGranted,
  PathfinderPermission,
  PersonInterventionsPermission,
  PersonPrisonCategoryPermission,
  PrisonerPermissions,
  PrisonerSchedulePermission,
  SOCPermission,
  UseOfForcePermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import HmppsAction from '../../interfaces/HmppsAction'
import { Icon } from '../../../data/enums/icon'
import { includesActiveCaseLoad } from '../../../utils/utils'
import conf from '../../../config'
import isServiceNavEnabled from '../../../utils/isServiceEnabled'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import Nominal from '../../../data/interfaces/manageSocCasesApi/Nominal'

export default (
  prisonerData: Prisoner,
  pathfinderNominal: Nominal | null,
  socNominal: Nominal | null,
  user: HmppsUser,
  config: typeof conf,
  feComponentsSharedData: HeaderFooterSharedData | undefined,
  permissions: PrisonerPermissions,
): HmppsAction[] => {
  const actions: HmppsAction[] = []
  const addAppointmentUrl = config.featureToggles.profileAddAppointmentEnabled
    ? `/prisoner/${prisonerData.prisonerNumber}/add-appointment`
    : `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/add-appointment`

  if (isGranted(CaseNotesPermission.edit, permissions)) {
    actions.push({
      text: 'Add case note',
      icon: Icon.AddCaseNote,
      url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
      dataQA: 'add-case-note-action-link',
    })
  }

  if (user.authSource === 'nomis' && user.keyWorkerAtPrisons?.[prisonerData.prisonId]) {
    actions.push({
      text: 'Add key worker session',
      icon: Icon.AddKeyWorkerSession,
      url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note?type=KA`,
      dataQA: 'add-key-worker-session-action-link',
    })
  }

  if (isGranted(PrisonerSchedulePermission.edit_appointment, permissions)) {
    actions.push({
      text: 'Add appointment',
      icon: Icon.AddAppointment,
      url: addAppointmentUrl,
      dataQA: 'add-appointment-action-link',
    })
  }
  if (
    isGranted(UseOfForcePermission.edit, permissions) &&
    !includesActiveCaseLoad(config.featureToggles.useOfForceDisabledPrisons, user)
  ) {
    actions.push({
      text: 'Report use of force',
      icon: Icon.ReportUseOfForce,
      url: `${config.serviceUrls.useOfForce}/report/${prisonerData.bookingId}/report-use-of-force`,
      dataQA: 'report-use-of-force-action-link',
    })
  }

  if (
    isGranted(PrisonerSchedulePermission.edit_activity, permissions) &&
    isServiceNavEnabled('activities', feComponentsSharedData)
  ) {
    actions.push({
      text: 'Log an activity application',
      icon: Icon.LogActivityApplication,
      url: `${config.serviceUrls.activities}/waitlist/${prisonerData.prisonerNumber}/apply`,
      dataQA: 'log-an-activity-application-link',
    })
  }

  if (isGranted(PathfinderPermission.edit, permissions) && !pathfinderNominal) {
    actions.push({
      text: 'Refer to Pathfinder',
      icon: Icon.ReferToPathfinder,
      url: `${config.serviceUrls.pathfinder}/refer/offender/${prisonerData.prisonerNumber}`,
      dataQA: 'refer-to-pathfinder-action-link',
    })
  }

  if (isGranted(SOCPermission.edit, permissions) && !socNominal) {
    actions.push({
      text: 'Add to SOC',
      icon: Icon.AddToSOC,
      url: `${config.serviceUrls.manageSocCases}/refer/offender/${prisonerData.prisonerNumber}`,
      dataQA: 'add-to-soc-action-link',
    })
  }

  if (isGranted(PersonPrisonCategoryPermission.edit, permissions)) {
    actions.push({
      text: 'Manage category',
      icon: Icon.ManageCategory,
      url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
      dataQA: 'manage-category-action-link',
    })
  }

  if (
    isGranted(PersonInterventionsPermission.read_csip, permissions) &&
    isServiceNavEnabled('csipUI', feComponentsSharedData)
  ) {
    actions.push({
      text: 'Make CSIP referral',
      icon: Icon.MakeCSIPReferral,
      url: `${config.serviceUrls.csip}/prisoners/${prisonerData.prisonerNumber}/referral/start`,
      dataQA: 'make-csip-referral-action-link',
    })
  }

  if (
    isGranted(PrisonerSchedulePermission.edit_activity, permissions) &&
    config.featureToggles.manageAllocationsEnabled &&
    isServiceNavEnabled('activities', feComponentsSharedData)
  ) {
    actions.push({
      text: 'Manage activity allocations',
      icon: Icon.ManageAllocations,
      url: `${config.serviceUrls.activities}/prisoner-allocations/${prisonerData.prisonerNumber}`,
      dataQA: 'manage-allocations-link',
    })
  }

  return actions
}
