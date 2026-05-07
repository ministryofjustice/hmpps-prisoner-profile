import { formatDate } from '../../utils/dateHelpers'
import config from '../../config'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'
import { MiniCardMapper } from '../components/miniCard/miniCardData'

const mapper: MiniCardMapper<OverviewPageData['categorySummary'], [boolean, number]> = (
  categorySummary,
  prisonerInCaseLoad,
  bookingId,
) => {
  const { codeDescription, nextReviewDate, userCanManage } = categorySummary || {}
  return {
    id: 'category',
    heading: 'Category',
    items: [
      {
        text: codeDescription || 'Not entered',
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

export default mapper
