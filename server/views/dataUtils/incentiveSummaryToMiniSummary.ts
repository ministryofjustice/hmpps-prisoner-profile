import OverviewPage, { isIncentiveSummaryError } from '../../services/interfaces/overviewPageService/OverviewPage'
import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import config from '../../config'
import { formatDate } from '../../utils/dateHelpers'
import { pluralise } from '../../utils/pluralise'

export default (
  incentiveSummary: OverviewPage['incentiveSummary'] | undefined,
  prisonerNumber: string,
  prisonerDisplayName: string,
): MiniSummaryData => {
  // if all values of incentiveSummary object are null return no data message
  if (!Object.values(incentiveSummary).some(value => value !== null)) {
    return {
      bottomLabel: 'Incentives: since last review',
      bottomContentLine1: `${prisonerDisplayName} has no incentive level history`,
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    }
  }

  // if api call failed. Will be replaced with Result logic
  if (isIncentiveSummaryError(incentiveSummary))
    return {
      bottomLabel: 'Incentives: since last review',
      bottomContentLine1: 'We cannot show these details right now',
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
    }

  const { positiveBehaviourCount, negativeBehaviourCount, nextReviewDate, daysOverdue } = incentiveSummary

  return {
    bottomLabel: 'Incentives: since last review',
    bottomContentLine1: `Positive behaviours: ${positiveBehaviourCount}`,
    bottomContentLine2: `Negative behaviours: ${negativeBehaviourCount}`,
    bottomContentLine3: `Next review by: ${formatDate(nextReviewDate, 'short')}`,
    bottomContentError: daysOverdue !== undefined ? `${pluralise(daysOverdue, 'day')} overdue` : undefined,
    bottomClass: 'small',
    linkLabel: 'Incentive level details',
    linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerNumber}`,
  }
}
