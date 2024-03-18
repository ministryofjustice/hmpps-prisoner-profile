import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'
import CourtAppearanceSummary from '../../services/interfaces/offencesService/CourtAppearanceSummary'
import HmppsAction from './HmppsAction'

export default interface OverviewPageData extends OverviewPage {
  pageTitle: string
  courtCaseSummary?: CourtCaseSummary
  overviewActions: HmppsAction[]
  overviewInfoLinks: { text: string; url: string; dataQA: string }[]
  canView: boolean
  canAdd: boolean
  prisonerDisplayName: string
}

export interface CourtCaseSummary {
  nextCourtAppearance: CourtAppearanceSummary | null
  link: {
    text: string
    href: string
  }
}
