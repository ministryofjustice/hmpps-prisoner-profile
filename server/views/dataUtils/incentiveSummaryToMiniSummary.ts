import {
  isGranted,
  PrisonerIncentivesPermission,
  PrisonerPermissions,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import config from '../../config'
import { formatDate } from '../../utils/dateHelpers'
import { pluralise } from '../../utils/pluralise'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import { MiniCardData } from '../components/miniCard/miniCardData'
import { unavailablePlaceholder } from '../../utils/utils'
import { Result } from '../../utils/result/result'

export default (
  incentiveSummary: Result<IncentiveSummary, Error>,
  prisonerNumber: string,
  prisonerDisplayName: string,
  prisonerPermissions: PrisonerPermissions,
): MiniCardData => {
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
    }

  // if all values of incentiveSummary object are null return no data message
  if (!Object.values(incentiveSummary.getOrNull() || {}).some(value => value !== null))
    return {
      heading: 'Incentives',
      label: 'Since last review',
      items: [
        {
          text: `${prisonerDisplayName} has no incentive level history`,
        },
      ],
      linkLabel: 'Incentive level details',
      linkHref: isGranted(PrisonerIncentivesPermission.read_incentive_level_history, prisonerPermissions)
        ? `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`
        : undefined,
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
    linkHref: isGranted(PrisonerIncentivesPermission.read_incentive_level_history, prisonerPermissions)
      ? `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`
      : undefined,
    linkLabel: 'Incentive level details',
  }
}
