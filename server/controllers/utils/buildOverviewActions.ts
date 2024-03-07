import Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'
import Nominal from '../../data/interfaces/manageSocCasesApi/Nominal'
import { User } from '../../data/hmppsAuthClient'
import { HmppsAction } from '../../interfaces/hmppsAction'
import { canAddCaseNotes, canViewCalculateReleaseDates } from '../../utils/roleHelpers'
import { Icon } from '../../data/enums/icon'
import { userCanEdit, userHasRoles } from '../../utils/utils'
import { Role } from '../../data/enums/role'
import conf from '../../config'
import { HeaderFooterMeta } from '../../data/interfaces/componentApi/Component'
import isServiceEnabled from '../../utils/isServiceEnabled'

export default (
  prisonerData: Prisoner,
  pathfinderNominal: Nominal | null,
  socNominal: Nominal | null,
  user: User,
  staffRoles: string[],
  config: typeof conf,
  feComponentsMeta: HeaderFooterMeta | undefined,
): HmppsAction[] => {
  const actions: HmppsAction[] = []
  const addAppointmentUrl = config.featureToggles.profileAddAppointmentEnabled
    ? `/prisoner/${prisonerData.prisonerNumber}/add-appointment`
    : `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/add-appointment`

  if (canViewCalculateReleaseDates(user)) {
    actions.push({
      text: 'Calculate release dates',
      icon: Icon.CalculateReleaseDates,
      url: `${config.serviceUrls.calculateReleaseDates}/?prisonId=${prisonerData.prisonerNumber}`,
      dataQA: 'calculate-release-dates-action-link',
    })
  }
  if (canAddCaseNotes(user, prisonerData)) {
    actions.push({
      text: 'Add case note',
      icon: Icon.AddCaseNote,
      url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
      dataQA: 'add-case-note-action-link',
    })
  }
  if (staffRoles.includes('KW')) {
    actions.push({
      text: 'Add key worker session',
      icon: Icon.AddKeyWorkerSession,
      url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note?type=KA&subType=KS`,
      dataQA: 'add-key-worker-session-action-link',
    })
  }
  if (user.activeCaseLoadId === prisonerData.prisonId && !prisonerData.restrictedPatient) {
    actions.push({
      text: 'Add appointment',
      icon: Icon.AddAppointment,
      url: addAppointmentUrl,
      dataQA: 'add-appointment-action-link',
    })
  }
  if (
    userCanEdit(user, prisonerData) &&
    !prisonerData.restrictedPatient &&
    !config.featureToggles.useOfForceDisabledPrisons.includes(user.activeCaseLoadId)
  ) {
    actions.push({
      text: 'Report use of force',
      icon: Icon.ReportUseOfForce,
      url: `${config.serviceUrls.useOfForce}/report/${prisonerData.bookingId}/report-use-of-force`,
      dataQA: 'report-use-of-force-action-link',
    })
  }
  if (
    userHasRoles([Role.ActivityHub], user.userRoles) &&
    isServiceEnabled('activities', feComponentsMeta) &&
    user.activeCaseLoadId === prisonerData.prisonId &&
    prisonerData.status !== 'ACTIVE OUT'
  ) {
    actions.push({
      text: 'Log an activity application',
      icon: Icon.LogActivityApplication,
      url: `${config.serviceUrls.activities}/waitlist/${prisonerData.prisonerNumber}/apply`,
      dataQA: 'log-an-activity-application-link',
    })
  }
  if (
    userHasRoles(
      [Role.PathfinderApproval, Role.PathfinderStdPrison, Role.PathfinderStdProbation, Role.PathfinderHQ],
      user.userRoles,
    ) &&
    !pathfinderNominal
  ) {
    actions.push({
      text: 'Refer to Pathfinder',
      icon: Icon.ReferToPathfinder,
      url: `${config.serviceUrls.pathfinder}/refer/offender/${prisonerData.prisonerNumber}`,
      dataQA: 'refer-to-pathfinder-action-link',
    })
  }
  if (userHasRoles([Role.SocCustody, Role.SocCommunity], user.userRoles) && !socNominal) {
    actions.push({
      text: 'Add to SOC',
      icon: Icon.AddToSOC,
      url: `${config.serviceUrls.manageSocCases}/refer/offender/${prisonerData.prisonerNumber}`,
      dataQA: 'add-to-soc-action-link',
    })
  }
  if (
    userHasRoles(
      [Role.CreateCategorisation, Role.ApproveCategorisation, Role.CreateRecategorisation, Role.CategorisationSecurity],
      user.userRoles,
    )
  ) {
    actions.push({
      text: 'Manage category',
      icon: Icon.ManageCategory,
      url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
      dataQA: 'manage-category-action-link',
    })
  }

  return actions
}
