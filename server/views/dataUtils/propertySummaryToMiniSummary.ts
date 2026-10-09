import {
  isGranted,
  PrisonerPermissions,
  PrisonerPropertyPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { MiniCardMapper } from '../components/miniCard/miniCardData'
import { pluralise } from '../../utils/pluralise'
import { Result } from '../../utils/result/result'
import { PrisonerPropertySummary } from '../../data/interfaces/prisonerPropertyApi/prisonerPropertyApiClient'
import config from '../../config'

const mapper: MiniCardMapper<Result<PrisonerPropertySummary>, [string, PrisonerPermissions]> = (
  propertySummaryResult,
  prisonerNumber,
  prisonerPermissions,
) => {
  if (propertySummaryResult.status === 'fulfilled') {
    const summary = propertySummaryResult.getOrNull()

    const warningItem = (text: string) => ({
      text,
      showWarningIcon: true,
      classes: 'hmpps-red-text govuk-!-font-weight-bold',
    })

    return {
      heading: 'Property',
      id: 'property',
      topLabel: `Containers in ${summary.currentEstablishmentName}`,
      topContent: summary.heldInCurrentEstablishment,
      topClass: 'big',
      items: [
        { text: `Due for transfer in: ${summary.dueForTransferIn}` },
        { text: `Due for transfer out: ${summary.dueForTransferOut}` },
        ...(summary.overdueForDisposal > 0
          ? [warningItem(`${pluralise(summary.overdueForDisposal, 'disposal')} overdue`)]
          : []),
        ...(summary.overdueForReturn > 0
          ? [warningItem(`${pluralise(summary.overdueForReturn, 'return')} overdue`)]
          : []),
      ],
      linkLabel: 'Property',
      linkHref: isGranted(PrisonerPropertyPermission.read_property_details, prisonerPermissions)
        ? `${config.serviceUrls.prisonerProperty}/prisoner/${prisonerNumber}`
        : undefined,
    }
  }

  return {
    heading: 'Property',
    id: 'property',
  }
}

export default mapper
