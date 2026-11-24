import type { RequestHandler } from 'express'
import type { Services } from '../services'
import type { Page } from '../services/interfaces/auditService/page'
import type { ApiAction } from '../services/interfaces/auditService/actions'

export default function auditPageAccessAttempt({
  services,
  page: pageViewAction,
}: {
  services: Services
  page: Page | ApiAction
}): RequestHandler {
  return async (req, res, next) => {
    const { requestId, user } = res.locals
    const { prisonerNumber } = req.params
    const { auditService } = services

    await auditService.sendAccessAttempt({
      user,
      prisonerNumber,
      page: pageViewAction,
      correlationId: requestId,
      justification: req.session.justifiedHighProfilePrisonerAccess?.[prisonerNumber] ?? null,
    })

    next()
  }
}
