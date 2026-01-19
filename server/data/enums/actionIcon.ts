/**
 * Collection of 40×40 action SVG icons in `/assets/images/actions`.
 * Used by DPS components:
 * - action button
 * - actions block
 * - mini actions block
 */
export enum ActionIcon {
  AddAlert = 'add-alert',
  AddAppointment = 'add-appointment',
  AddCaseNote = 'add-case-note',
  AddKeyWorkerSession = 'add-key-worker-session',
  AddNonAssociation = 'add-non-association',
  AddTemporaryAbsence = 'add-temporary-absence',
  AddToSOC = 'add-to-soc',
  CalculateReleaseDates = 'calculate-release-dates',
  ChangeCell = 'change-cell',
  LogActivityApplication = 'log-an-activity-appointment',
  MakeCSIPReferral = 'make-csip-referral',
  ManageAllocations = 'manage-allocations',
  ManageCategory = 'manage-category',
  MoveToReception = 'move-to-reception',
  RecordIncentiveReview = 'record-incentive-review',
  ReferToPathfinder = 'refer-to-pathfinder',
  ReportUseOfForce = 'report-use-of-force',
}

export default { Icon: ActionIcon }
