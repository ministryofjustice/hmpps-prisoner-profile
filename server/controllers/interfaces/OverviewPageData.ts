import CourtAppearanceSummary from '../../services/interfaces/offencesService/CourtAppearanceSummary'
import HmppsAction from './HmppsAction'
import LatestCalculationSummary from '../../services/interfaces/offencesService/LatestCalculationSummary'
import AccountBalances from '../../data/interfaces/prisonApi/AccountBalances'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'
import VisitsOverviewSummary from '../../services/interfaces/visitsService/VisitsOverviewSummary'
import OverviewSchedule from '../../services/interfaces/scheduleService/OverviewSchedule'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import StaffContacts, { YouthStaffContacts } from '../../data/interfaces/prisonApi/StaffContacts'
import FullStatus from '../../data/interfaces/prisonApi/FullStatus'
import NonAssociationSummary from '../../services/interfaces/offenderService/NonAssociationSummary'
import { Result } from '../../utils/result/result'
import CurrentCsipDetail from '../../data/interfaces/csipApi/csip'
import { PersonalRelationshipsContactCount } from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default interface OverviewPageData {
  pageTitle: string
  courtCaseSummary: CourtCaseSummary
  overviewActions: HmppsAction[]
  overviewInfoLinks: { text: string; url: string; dataQA: string }[]
  prisonerDisplayName: string
  prisonerInCaseLoad: boolean
  bookingId: number
  moneySummary: AccountBalances | null
  adjudicationSummary: Result<AdjudicationsOverviewSummary>
  visitsSummary: VisitsOverviewSummary | null
  schedule: OverviewSchedule
  csraSummary: CsraSummary
  categorySummary: CategorySummary
  incentiveSummary: IncentiveSummary | { error: true } | null
  currentCsipDetail: Result<CurrentCsipDetail>
  statuses: OverviewStatus[]
  personalDetails: PersonalDetails
  staffContacts: YouthStaffContacts | StaffContacts
  isYouthPrisoner: boolean
  prisonName: string
  offencesOverview: {
    mainOffenceDescription: string
    fullStatus: FullStatus
    imprisonmentStatusDescription: string
    conditionalReleaseDate: string
    confirmedReleaseDate: string
  }
  nonAssociationSummary: Result<NonAssociationSummary>
  externalContactsSummary: Result<PersonalRelationshipsContactCount>
  options: {
    showCourtCaseSummary: boolean
  }
}

export interface CourtCaseSummary {
  nextCourtAppearance: CourtAppearanceSummary | null
  activeCourtCasesCount: number
  latestCalculation: Result<LatestCalculationSummary>
  link: {
    text: string
    href: string
  }
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

export interface OverviewStatus {
  label: string
  date?: string
  subText?: string
  error?: boolean
}

interface PersonalDetails {
  personalDetailsMain: {
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
