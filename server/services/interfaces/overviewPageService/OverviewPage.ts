import FullStatus from '../../../data/interfaces/prisonApi/FullStatus'

export default interface OverviewPage {
  moneySummary?: MoneySummary
  adjudicationSummary?: AdjudicationSummary
  visitsSummary?: VisitsSummary
  csraSummary: CsraSummary
  categorySummary: CategorySummary
  incentiveSummary?: IncentiveSummary | { error: true }
  statuses: OverviewStatus[]
  nonAssociationSummary: NonAssociationSummary
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: OverviewSchedule
  offencesOverview: {
    mainOffenceDescription: string
    fullStatus: FullStatus
    imprisonmentStatusDescription: string
    conditionalReleaseDate: string
    confirmedReleaseDate: string
  }
  prisonName: string
  staffRoles: string[]
  isYouthPrisoner: boolean
}

export interface OverviewScheduleItem {
  name: string
  startTime?: string
  endTime?: string
}

export interface OverviewSchedule {
  morning: OverviewScheduleItem[]
  afternoon: OverviewScheduleItem[]
  evening: OverviewScheduleItem[]
}

export interface OverviewNonAssociation {
  nonAssociationName: string
  offenderNo: string
  assignedLivingUnitDescription: string
  reasonDescription: string
  agencyId: string
}

export interface AlertsSummary {
  activeAlertCount: number
  nonAssociationsCount: number
  nonAssociationsUrl: string
}

interface MoneySummary {
  spends: number
  cash: number
}

interface AdjudicationSummary {
  adjudicationCount: number
  activePunishments: number
}

interface VisitsSummary {
  startDate: string
  remainingVo: number
  remainingPvo: number
}

interface CsraSummary {
  classification?: string
  assessmentDate?: string
}

interface CategorySummary {
  codeDescription: string
  nextReviewDate?: string
  userCanManage: boolean
}

interface IncentiveSummary {
  positiveBehaviourCount: number
  negativeBehaviourCount: number
  nextReviewDate: string
  daysOverdue: number | undefined
}

export const isIncentiveSummaryError = (
  incentiveSummary: IncentiveSummary | { error: true },
): incentiveSummary is { error: true } => {
  return 'error' in incentiveSummary
}

interface NonAssociationSummary {
  prisonName: string
  prisonCount: number
  otherPrisonsCount: number
}

interface PersonalDetails {
  personalDetailsMain: {
    preferredName: string
    dateOfBirth: string
    age: { years: number; months: number } | null
    nationality: string
    spokenLanguage: string
  }
  personalDetailsSide: {
    ethnicGroup: string
    religionOrBelief: string
    croNumber: string
    pncNumber: string
  }
}

interface OverviewStatus {
  label: string
  date?: string
  subText?: string
  error?: boolean
}
