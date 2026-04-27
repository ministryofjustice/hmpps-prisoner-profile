import { formatDate } from '../../utils/dateHelpers'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'
import { MiniCardMapper } from '../components/miniCard/miniCardData'

const mapper: MiniCardMapper<OverviewPageData['csraSummary'], [boolean, string]> = (
  csraSummary,
  showCsraHistoryLink,
  prisonerNumber,
) => {
  const { classification, assessmentDate } = csraSummary || {}
  return {
    id: 'csra',
    heading: 'CSRA',
    items: [
      {
        text: classification || 'Not entered',
      },
      ...(assessmentDate
        ? [
            {
              text: `Last review: ${formatDate(assessmentDate, 'short')}`,
              classes: 'hmpps-secondary-text',
            },
          ]
        : []),
    ],
    ...(showCsraHistoryLink
      ? {
          linkHref: `/prisoner/${prisonerNumber}/csra-history`,
          linkLabel: 'CSRA history',
        }
      : {}),
  }
}

export default mapper
