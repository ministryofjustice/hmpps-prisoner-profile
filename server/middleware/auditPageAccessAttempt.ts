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
    const { requestId } = res.locals
    const { username, userRoles } = res.locals.user
    const { prisonerNumber } = req.params
    const { auditService } = services

    await auditService.sendAccessAttempt({
      userId: username,
      userRoles,
      prisonerNumber,
      page: pageViewAction,
      correlationId: requestId,
    })

    next()
  }
}
