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
      topLabel: `Containers in ${summary.prisonName}`,
      topContent: summary.heldAtThisPrison,
      topClass: 'big',
      items: [
        { text: `Due for transfer in: ${summary.dueToTransferIn}` },
        { text: `Due for transfer out: ${summary.dueToTransferOut}` },
        ...(summary.dueToBeDisposed > 0
          ? [warningItem(`${pluralise(summary.dueToBeDisposed, 'disposal')} overdue`)]
          : []),
        ...(summary.dueToBeReturned > 0
          ? [warningItem(`${pluralise(summary.dueToBeReturned, 'return')} overdue`)]
          : []),
      ],
      linkLabel: 'Property',
      linkHref: isGranted(PrisonerPropertyPermission.read_property_details, prisonerPermissions)
        ? `${config.serviceUrls.prisonerProperty}/prisoner/${prisonerNumber}?returnToService=prisonerProfile`
        : undefined,
    }
  }

  return {
    heading: 'Property',
    id: 'property',
  }
}

export default mapper
