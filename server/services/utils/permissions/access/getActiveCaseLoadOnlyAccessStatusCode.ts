import { isActiveCaseLoad } from '../../../../utils/utils'
import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import getOverviewAccessStatusCode from './getOverviewAccessStatusCode'
import Prisoner from '../../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../../interfaces/HmppsUser'

export default function getActiveCaseLoadOnlyAccessStatusCode(user: HmppsUser, prisoner: Prisoner): HmppsStatusCode {
  if (!isActiveCaseLoad(prisoner.prisonId, user)) return HmppsStatusCode.NOT_IN_CASELOAD

  return getOverviewAccessStatusCode(user, prisoner)
}
