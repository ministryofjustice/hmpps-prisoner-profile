import type { RequestHandler } from 'express'
import type { Services } from '../services'
import config from '../config'

/**
 * Sets flags for high-profile prisoners:
 * - `res.locals.isHighProfilePrisoner`
 * - `res.locals.isHighProfilePrisonerOutsideCaseloads` when also in prison, but not in user’s caseloads
 */
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

    const { user } = res.locals
    const { prisonerNumber, prisonId } = req.middleware.prisonerData

    const permissionsApiClient = permissionsApiClientBuilder(req.middleware.clientToken)
    res.locals.isHighProfilePrisoner = await permissionsApiClient.checkHighProfilePrisonerStatus(prisonerNumber)

    // NB: always false for non-prison users
    res.locals.isHighProfilePrisonerOutsideCaseloads = false
    if (
      res.locals.isHighProfilePrisoner &&
      user.authSource === 'nomis' &&
      prisonId &&
      prisonId !== 'TRN' &&
      prisonId !== 'OUT'
    ) {
      const inCaseLoads = user.caseLoads.some(caseLoad => caseLoad.caseLoadId === prisonId)
      res.locals.isHighProfilePrisonerOutsideCaseloads = !inCaseLoads
    }

    next()
  }
}
