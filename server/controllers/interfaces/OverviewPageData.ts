import { Result } from '../../utils/result/result'
import HmppsAction from './HmppsAction'
import CurrentCsipDetail from '../../data/interfaces/csipApi/csip'
import { PersonalRelationshipsContactCount } from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import AccountBalances from '../../data/interfaces/prisonApi/AccountBalances'
import FullStatus from '../../data/interfaces/prisonApi/FullStatus'
import StaffContacts, { YouthStaffContacts } from '../../data/interfaces/prisonApi/StaffContacts'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import CourtAppearanceSummary from '../../services/interfaces/offencesService/CourtAppearanceSummary'
import LatestCalculationSummary from '../../services/interfaces/offencesService/LatestCalculationSummary'
import NonAssociationSummary from '../../services/interfaces/offenderService/NonAssociationSummary'
import OverviewSchedule from '../../services/interfaces/scheduleService/OverviewSchedule'
import VisitsOverviewSummary from '../../services/interfaces/visitsService/VisitsOverviewSummary'
import { XrayBodyScanSummary } from '../utils/overviewController/mapXrayBodyScanData'

export default interface OverviewPageData {
  pageTitle: string
  courtCaseSummary: CourtCaseSummary
  overviewActions: HmppsAction[]
  overviewInfoLinks: { text: string; url: string; dataQA: string }[]
  prisonerDisplayName: string
  prisonerInCaseLoad: boolean
  prisonerNumber: string
  bookingId: number
  moneySummary: AccountBalances | null
  adjudicationSummary: Result<AdjudicationsOverviewSummary>
  visitsSummary: VisitsOverviewSummary | null
  schedule: OverviewSchedule
  csraSummary: CsraSummary
  categorySummary: CategorySummary
  incentiveSummary: Result<IncentiveSummary>
  currentCsipDetail: Result<CurrentCsipDetail>
  statuses: OverviewStatus[]
  personalDetails: PersonalDetails
  staffContacts: YouthStaffContacts | StaffContacts
  isYouthPrisoner: boolean
  prisonName: string
  xrayBodyScanSummary: Result<XrayBodyScanSummary> | null
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
  actionsMayBeMissing: boolean
  confirmedReleaseDate: Result<string> | null
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
  subText?: string
  subTextHref?: string
  style?: undefined | 'prominent' | 'warning' | 'error'
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
