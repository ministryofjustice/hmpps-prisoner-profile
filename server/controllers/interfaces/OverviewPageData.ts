import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'
import CourtAppearanceSummary from '../../services/interfaces/offencesService/CourtAppearanceSummary'
import HmppsAction from './HmppsAction'
import LatestCalculationSummary from '../../services/interfaces/offencesService/LatestCalculationSummary'
import AccountBalances from '../../data/interfaces/prisonApi/AccountBalances'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'
import VisitsOverviewSummary from '../../services/interfaces/visitsService/VisitsOverviewSummary'
import OverviewSchedule from '../../services/interfaces/scheduleService/OverviewSchedule'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'

export default interface OverviewPageData extends OverviewPage {
  pageTitle: string
  courtCaseSummary: CourtCaseSummary
  overviewActions: HmppsAction[]
  overviewInfoLinks: { text: string; url: string; dataQA: string }[]
  prisonerDisplayName: string
  prisonerInCaseload: boolean
  bookingId: number
  options: {
    showCourtCaseSummary: boolean
  }
  moneySummary: AccountBalances | null
  adjudicationSummary: AdjudicationsOverviewSummary | null
  visitsSummary: VisitsOverviewSummary | null
  schedule: OverviewSchedule
  csraSummary: CsraSummary
  categorySummary: CategorySummary
  incentiveSummary: IncentiveSummary | { error: true } | null
}

export interface CourtCaseSummary {
  nextCourtAppearance: CourtAppearanceSummary | null
  activeCourtCasesCount: number
  latestCalculation: LatestCalculationSummary | null
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
