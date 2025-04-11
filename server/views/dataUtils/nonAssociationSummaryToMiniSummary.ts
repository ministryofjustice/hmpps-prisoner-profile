import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import NonAssociationSummary from '../../services/interfaces/offenderService/NonAssociationSummary'
import { Result } from '../../utils/result/result'
import { apiErrorMessage } from '../../utils/utils'
import config from '../../config'

export default (nonAssociationSummary: Result<NonAssociationSummary>, prisonerNumber: string): MiniSummaryData => {
  if (nonAssociationSummary.status === 'fulfilled') {
    const { prisonName, prisonCount, otherPrisonsCount } = nonAssociationSummary.getOrNull()
    return {
      heading: 'Non-associations',
      topLabel: `In ${prisonName}`,
      topContent: prisonCount,
      topClass: 'big',
      bottomLabel: 'In other establishments',
      bottomContentLine1: otherPrisonsCount,
      bottomClass: 'big',
      linkLabel: 'Non-associations',
      linkHref: `${config.serviceUrls.nonAssociations}/prisoner/${prisonerNumber}/non-associations`,
    }
  }

  return {
    heading: 'Non-associations',
    bottomLabel: null,
    bottomContentLine1: apiErrorMessage,
    bottomClass: 'small',
    linkLabel: 'Non-associations',
    linkHref: `${config.serviceUrls.nonAssociations}/prisoner/${prisonerNumber}/non-associations`,
  }
}
