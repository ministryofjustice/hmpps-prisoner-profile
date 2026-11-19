import type { RequestHandler } from 'express'
import type { Services } from '../services'
import config from '../config'

/** Sets `res.locals.isHighProfilePrisoner` flag to true for high profile prisoners */
// TODO: Fold into permissions library
// eslint-disable-next-line import/prefer-default-export
export function isHighProfilePrisonerMiddleware(services: Services): RequestHandler {
  const { permissionsApiClientBuilder } = services.dataAccess

  return async (req, res, next) => {
    if (!config.featureToggles.highProfilePrisonersEnabled) {
      next()
      return
    }

    if (!req.params?.prisonerNumber) {
      // only works on routes with known prisoner number
      throw new Error('Usage error: req.params.prisonerNumber is required')
    }

    res.locals.isHighProfilePrisoner = await permissionsApiClientBuilder(
      req.middleware.clientToken,
    ).checkHighProfilePrisonerStatus(req.params.prisonerNumber)
    next()
  }
}
