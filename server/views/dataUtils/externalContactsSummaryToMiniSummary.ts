import { MiniCardMapper } from '../components/miniCard/miniCardData'
import { Result } from '../../utils/result/result'
import config from '../../config'
import { unavailablePlaceholder } from '../../utils/utils'

const mapper: MiniCardMapper<Result<{ social: number; official: number }>, [string]> = (
  externalContactsSummary,
  prisonerNumber,
) => {
  if (externalContactsSummary.status === 'fulfilled') {
    const { social, official } = externalContactsSummary.value
    return {
      heading: 'External contacts',
      id: 'external-contacts',
      topLabel: 'Social',
      topContent: social,
      topClass: 'big',
      bottomLabel: 'Official',
      bottomContentLine1: official,
      bottomClass: 'big',
      linkLabel: 'Social and official contacts',
      linkHref: `${config.serviceUrls.contacts}/prisoner/${prisonerNumber}/contacts/list`,
    }
  }

  return {
    heading: 'External contacts',
    id: 'external-contacts',
    topLabel: 'Social',
    topContent: unavailablePlaceholder,
    topClass: 'small',
    bottomLabel: 'Official',
    bottomContentLine1: unavailablePlaceholder,
    bottomClass: 'small',
  }
}

export default mapper
