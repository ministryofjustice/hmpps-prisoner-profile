import type { RequestHandler } from 'express'
import { PageViewAction } from '../services/auditService'
import { Services } from '../services'

export default function auditPageView({
  services,
  pageViewAction,
}: {
  services: Services
  details: object
  pageViewAction: PageViewAction
}): RequestHandler {
  return async (req, res, next) => {
    const { username, userRoles } = res.locals.user
    const { prisonerNumber } = req.params
    const { auditService } = services

    await auditService.sendPageView({
      userId: username,
      prisonerNumber,
      pageViewAction,
      details: {
        globalView: false,
        releasedPrisonerView: false,
        userRoles,
      },
    })

    next()
  }
}
