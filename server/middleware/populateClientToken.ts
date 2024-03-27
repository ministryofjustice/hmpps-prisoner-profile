import { RequestHandler } from 'express'
import logger from '../../logger'
import { dataAccess } from '../data'

export default function populateClientToken(): RequestHandler {
  return async (req, res, next) => {
    try {
      const { systemToken } = dataAccess
      if (res.locals.user) {
        const clientToken = await systemToken(res.locals.user.username)
        if (clientToken) {
          req.middleware = { ...req.middleware, clientToken }
        } else {
          logger.info('No client token available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve client token for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
