import { NextFunction, Request, Response } from 'express'
import PermissionsService from '../services/permissionsService'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import { addMiddlewareError } from './middlewareHelpers'
import NotFoundError from '../utils/notFoundError'
import ServerError from '../utils/serverError'

export default function permissionsGuard(permissionService: PermissionsService, method: keyof PermissionsService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const prisoner = req.middleware?.prisonerData
    if (!prisoner) {
      return next(new ServerError('No PrisonerData found in middleware'))
    }

    const permissions = await permissionService[method](res.locals.user, prisoner, req.middleware?.clientToken)

    if (permissions.accessCode === HmppsStatusCode.OK) {
      req.middleware.permissions = permissions
      return next()
    }

    const errorMessage: Partial<Record<HmppsStatusCode, string>> = {
      [HmppsStatusCode.RESTRICTED_PATIENT]: 'Prisoner is restricted patient',
      [HmppsStatusCode.PRISONER_IS_RELEASED]: `Prisoner is inactive [${prisoner.prisonId}]`,
      [HmppsStatusCode.PRISONER_IS_TRANSFERRING]: `Prisoner is inactive [${prisoner.prisonId}]`,
      [HmppsStatusCode.NOT_IN_CASELOAD]: 'Prisoner not in case loads',
    }

    return next(
      addMiddlewareError(req, next, new NotFoundError(errorMessage[permissions.accessCode], permissions.accessCode)),
    )
  }
}
