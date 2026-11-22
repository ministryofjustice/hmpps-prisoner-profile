import type { RequestHandler } from 'express'
import { Services } from '../services'
import { Page } from '../services/interfaces/auditService/page'
import { ApiAction } from '../services/interfaces/auditService/actions'

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
