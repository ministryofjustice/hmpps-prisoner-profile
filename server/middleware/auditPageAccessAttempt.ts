import type { RequestHandler } from 'express'
import { ApiAction, Page } from '../services/auditService'
import { Services } from '../services'

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
    })

    next()
  }
}
