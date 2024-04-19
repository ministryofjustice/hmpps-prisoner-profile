import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import { formatDate } from '../../utils/dateHelpers'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'

export default (
  csraSummary: OverviewPageData['csraSummary'],
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
