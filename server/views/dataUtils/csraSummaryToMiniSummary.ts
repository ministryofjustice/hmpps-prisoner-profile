import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'
import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import { formatDate } from '../../utils/dateHelpers'

export default (
  csraSummary: OverviewPage['csraSummary'],
  prisonerInCaseload: boolean,
  prisonerNumber: string,
): MiniSummaryData => {
  const { classification, assessmentDate } = csraSummary

  const csraSummaryData = {
    bottomLabel: 'CSRA',
    bottomContentLine1: classification || 'Not entered',
    bottomContentLine3: assessmentDate ? `Last review: ${formatDate(assessmentDate, 'short')}` : '',
    bottomClass: 'small',
  }

  if (prisonerInCaseload)
    return {
      ...csraSummaryData,
      linkLabel: 'CSRA history',
      linkHref: `/prisoner/${prisonerNumber}/csra-history`,
    }

  return csraSummaryData
}
