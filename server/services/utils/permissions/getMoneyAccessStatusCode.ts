import { isInUsersCaseLoad } from '../../../utils/utils'
import { HmppsStatusCode } from '../../../data/enums/hmppsStatusCode'
import getOverviewAccessStatusCode from './getOverviewAccessStatusCode'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../interfaces/HmppsUser'

export default function getMoneyAccessStatusCode(user: HmppsUser, prisoner: Prisoner): HmppsStatusCode {
  if (prisoner.prisonId === 'OUT') return HmppsStatusCode.PRISONER_IS_RELEASED
  if (prisoner.prisonId === 'TRN') return HmppsStatusCode.PRISONER_IS_TRANSFERRING
  if (!isInUsersCaseLoad(prisoner.prisonId, user)) return HmppsStatusCode.NOT_IN_CASELOAD

  return getOverviewAccessStatusCode(user, prisoner)
}
