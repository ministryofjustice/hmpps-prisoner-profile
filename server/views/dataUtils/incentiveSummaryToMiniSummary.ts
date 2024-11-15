import config from '../../config'
import { formatDate } from '../../utils/dateHelpers'
import { pluralise } from '../../utils/pluralise'
import IncentiveSummary, { isIncentiveSummaryError } from '../../services/interfaces/incentivesService/IncentiveSummary'
import { MiniCardData } from '../components/miniCard/miniCardData'

export default (
  incentiveSummary: IncentiveSummary | { error: true } | undefined,
  prisonerNumber: string,
  prisonerDisplayName: string,
): MiniCardData => {
  // if all values of incentiveSummary object are null return no data message
  if (!Object.values(incentiveSummary).some(value => value !== null))
    return {
      heading: 'Incentives: since last review',
      items: [
        {
          text: `${prisonerDisplayName} has no incentive level history`,
        },
      ],
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    }

  // if api call failed. Will be replaced with Result logic
  if (isIncentiveSummaryError(incentiveSummary))
    return {
      heading: 'Incentives: since last review',
      items: [
        {
          text: 'We cannot show these details right now',
        },
      ],
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    }

  const { positiveBehaviourCount, negativeBehaviourCount, nextReviewDate, daysOverdue } = incentiveSummary

  return {
    heading: 'Incentives: since last review',
    items: [
      {
        text: `Positive behaviours: ${positiveBehaviourCount}`,
      },
      {
        text: `Negative behaviours: ${negativeBehaviourCount}`,
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
