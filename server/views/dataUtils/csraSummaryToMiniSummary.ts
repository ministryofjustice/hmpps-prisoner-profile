import { formatDate } from '../../utils/dateHelpers'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'
import { MiniCardData } from '../components/miniCard/miniCardData'

export default (
  csraSummary: OverviewPageData['csraSummary'],
  showCsraHistoryLink: boolean,
  prisonerNumber: string,
): MiniCardData => {
  const { classification, assessmentDate } = csraSummary

  return {
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
