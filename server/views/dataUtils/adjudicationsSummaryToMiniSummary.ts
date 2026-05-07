import { MiniCardMapper } from '../components/miniCard/miniCardData'
import { pluralise } from '../../utils/pluralise'
import config from '../../config'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'
import { Result } from '../../utils/result/result'
import { unavailablePlaceholder } from '../../utils/utils'

const mapper: MiniCardMapper<Result<AdjudicationsOverviewSummary>, [string]> = (
  adjudicationSummary,
  prisonerNumber,
) => {
  if (adjudicationSummary.status === 'fulfilled') {
    const { adjudicationCount, activePunishments } = adjudicationSummary.getOrNull()
    return {
      heading: 'Adjudications',
      id: 'adjudications',
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
    id: 'adjudications',
    topLabel: 'Proven in last 3 months',
    topContent: unavailablePlaceholder,
    topClass: 'small',
    bottomLabel: 'Active',
    bottomContentLine1: unavailablePlaceholder,
    bottomClass: 'small',
  }
}

export default mapper
