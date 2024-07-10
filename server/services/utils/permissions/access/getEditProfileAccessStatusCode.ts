import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import { HmppsUser } from '../../../../interfaces/HmppsUser'
import { userHasRoles } from '../../../../utils/utils'

export default function getEditProfileAccessStatusCode(user: HmppsUser): HmppsStatusCode {
  if (!userHasRoles(['DPS_APPLICATION_DEVELOPER'], user.userRoles)) return HmppsStatusCode.NOT_FOUND

  return HmppsStatusCode.OK
}
