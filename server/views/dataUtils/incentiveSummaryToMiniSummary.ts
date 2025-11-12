import config from '../../config'
import { formatDate } from '../../utils/dateHelpers'
import { pluralise } from '../../utils/pluralise'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import { MiniCardData } from '../components/miniCard/miniCardData'
import { unavailablePlaceholder } from '../../utils/utils'
import { Result } from '../../utils/result/result'

export default (
  incentiveSummary: Result<IncentiveSummary>,
  prisonerNumber: string,
  prisonerDisplayName: string,
): MiniCardData => {
  // if all values of incentiveSummary object are null return no data message
  if (!Object.values(incentiveSummary).some(value => value !== null))
    return {
      heading: 'Incentives',
      label: 'Since last review',
      items: [
        {
          text: `${prisonerDisplayName} has no incentive level history`,
        },
      ],
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    }

  // if api call failed.
  if (incentiveSummary.status === 'rejected')
    return {
      heading: 'Incentives',
      label: 'Since last review',
      items: [
        {
          text: unavailablePlaceholder,
        },
      ],
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    }

  const { positiveBehaviourCount, negativeBehaviourCount, nextReviewDate, daysOverdue } = incentiveSummary.getOrNull()

  return {
    heading: 'Incentives',
    label: 'Since last review',
    items: [
      {
        text: `Positive behaviours: ${positiveBehaviourCount}`,
      },
      {
        text: `Negative behaviours: ${negativeBehaviourCount}`,
        classes: 'govuk-!-margin-bottom-3',
      },
      {
        text: `Next review by: ${formatDate(nextReviewDate, 'short')}`,
        classes: 'hmpps-secondary-text',
      },
      ...(daysOverdue
        ? [
            {
              text: `${pluralise(daysOverdue, 'day')} overdue`,
              classes: 'hmpps-red-text govuk-!-font-weight-bold',
            },
          ]
        : []),
    ],
    linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    linkLabel: 'Incentive level details',
  }
}
