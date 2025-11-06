import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import { pluralise } from '../../utils/pluralise'
import config from '../../config'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'
import { Result } from '../../utils/result/result'
import { apiErrorMessage, unavailablePlaceholder } from '../../utils/utils'

export default (adjudicationSummary: Result<AdjudicationsOverviewSummary>, prisonerNumber: string): MiniSummaryData => {
  if (adjudicationSummary.status === 'fulfilled') {
    const { adjudicationCount, activePunishments } = adjudicationSummary.getOrNull()
    return {
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: adjudicationCount,
      topClass: 'big',
      bottomLabel: 'Active',
      bottomContentLine1: pluralise(activePunishments, 'active punishment', {
        emptyMessage: 'No active punishments',
      }),
      bottomContentLine1Href: activePunishments
        ? `${config.serviceUrls.adjudications}/active-punishments/${prisonerNumber}`
        : undefined,
      bottomClass: 'small',
      linkLabel: 'Adjudication history',
      linkHref: `${config.serviceUrls.adjudications}/adjudication-history/${prisonerNumber}`,
    }
  }

  return {
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: unavailablePlaceholder,
      topClass: 'small',
      bottomLabel: 'Active',
      bottomContentLine1: unavailablePlaceholder,
      bottomClass: 'small',
    }
}
