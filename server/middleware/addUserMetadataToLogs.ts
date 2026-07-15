import type { RequestHandler } from 'express'
import { trace } from '@ministryofjustice/hmpps-azure-telemetry'
import { HmppsUser } from '../interfaces/HmppsUser'

export default function addUserMetadataToLogs(): RequestHandler {
  return async (_req, res, next) => {
    const span = trace.getActiveSpan()
    if (!span) return next()

    const user = (res.locals?.user ?? {}) as HmppsUser

    if (user.username) {
      span.setAttribute('username', user.username)
      if ('activeCaseLoadId' in user && user.activeCaseLoadId) {
        span.setAttribute('activeCaseLoadId', user.activeCaseLoadId)
      }
    }
    return next()
  }
}
