import { formatDate } from '../../utils/dateHelpers'
import config from '../../config'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'
import { MiniCardData } from '../components/miniCard/miniCardData'

export default (
  categorySummary: OverviewPageData['categorySummary'],
  prisonerInCaseLoad: boolean,
  bookingId: number,
): MiniCardData => {
  const { codeDescription, nextReviewDate, userCanManage } = categorySummary

  return {
    heading: 'Category',
    items: [
      {
        text: codeDescription,
        classes: 'hmpps-mini-card__big',
      },
      ...(nextReviewDate
        ? [
            {
              text: `Next review: ${formatDate(nextReviewDate, 'short')}`,
              classes: 'hmpps-secondary-text',
            },
          ]
        : []),
    ],
    ...(prisonerInCaseLoad
      ? {
          linkHref: `${config.serviceUrls.offenderCategorisation}/${bookingId}`,
          linkLabel: userCanManage ? 'Manage category' : 'Category',
        }
      : {}),
  }
}
