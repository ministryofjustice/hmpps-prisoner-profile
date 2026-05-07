import {
  isGranted,
  PrisonerIncentivesPermission,
  PrisonerPermissions,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import config from '../../config'
import { formatDate } from '../../utils/dateHelpers'
import { pluralise } from '../../utils/pluralise'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import { MiniCardMapper } from '../components/miniCard/miniCardData'
import { unavailablePlaceholder } from '../../utils/utils'
import { Result } from '../../utils/result/result'

const mapper: MiniCardMapper<Result<IncentiveSummary, Error>, [string, string, PrisonerPermissions]> = (
  incentiveSummary,
  prisonerNumber,
  prisonerDisplayName,
  prisonerPermissions,
) => {
  // if api call failed.
  if (incentiveSummary.status === 'rejected')
    return {
      heading: 'Incentives',
      id: 'incentives',
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
      id: 'incentives',
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
    id: 'incentives',
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
              showWarningIcon: true,
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

export default mapper
