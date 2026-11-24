import type { RequestHandler } from 'express'
import type { Services } from '../services'
import config from '../config'

/** Sets `res.locals.isHighProfilePrisoner` flag to true for high profile prisoners */
// eslint-disable-next-line import/prefer-default-export
export function isHighProfilePrisonerMiddleware(services: Services): RequestHandler {
  const { permissionsApiClientBuilder } = services.dataAccess

  return async (req, res, next) => {
    if (!config.featureToggles.highProfilePrisonersEnabled) {
      next()
      return
    }

    if (!req.middleware?.prisonerData?.prisonerNumber) {
      throw new Error('Usage error: requires getPrisonerData middleware')
    }

    const { prisonerNumber } = req.middleware.prisonerData

    const permissionsApiClient = permissionsApiClientBuilder(req.middleware.clientToken)
    res.locals.isHighProfilePrisoner = await permissionsApiClient.checkHighProfilePrisonerStatus(prisonerNumber)

    next()
  }
}
