import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import { pluralise } from '../../utils/pluralise'
import config from '../../config'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'

export default (adjudicationSummary: AdjudicationsOverviewSummary, prisonerNumber: string): MiniSummaryData => {
  return {
    heading: 'Adjudications',
    topLabel: 'Proven in last 3 months',
    topContent: adjudicationSummary.adjudicationCount,
    topClass: 'big',
    bottomLabel: 'Active',
    bottomContentLine1: pluralise(adjudicationSummary.activePunishments, 'active punishment', {
      emptyMessage: 'No active punishments',
    }),
    bottomContentLine1Href: adjudicationSummary.activePunishments
      ? `${config.serviceUrls.adjudications}/active-punishments/${prisonerNumber}`
      : undefined,
    bottomClass: 'small',
    linkLabel: 'Adjudication history',
    linkHref: `${config.serviceUrls.adjudications}/adjudication-history/${prisonerNumber}`,
  }
}
