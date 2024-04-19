import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import { formatDate } from '../../utils/dateHelpers'
import config from '../../config'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'

export default (
  categorySummary: OverviewPageData['categorySummary'],
  prisonerInCaseload: boolean,
  bookingId: number,
): MiniSummaryData => {
  const { codeDescription, nextReviewDate, userCanManage } = categorySummary

  const categorySummaryData = {
    bottomLabel: 'Category',
    bottomContentLine1: codeDescription,
    bottomContentLine3: nextReviewDate ? `Next review: ${formatDate(nextReviewDate, 'short')}` : '',
    bottomClass: 'small',
  }

  if (prisonerInCaseload)
    return {
      ...categorySummaryData,
      linkLabel: userCanManage ? 'Manage category' : 'Category',
      linkHref: `${config.serviceUrls.offenderCategorisation}/${bookingId}`,
    }

  return categorySummaryData
}
