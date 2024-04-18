import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'
import CourtAppearanceSummary from '../../services/interfaces/offencesService/CourtAppearanceSummary'
import HmppsAction from './HmppsAction'
import LatestCalculationSummary from '../../services/interfaces/offencesService/LatestCalculationSummary'

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
