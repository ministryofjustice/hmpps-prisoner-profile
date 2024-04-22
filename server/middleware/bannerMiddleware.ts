import type { RequestHandler } from 'express'

import logger from '../../logger'
import { Services } from '../services'

export default function bannerMiddleware({ contentfulService }: Services): RequestHandler {
  return async (req, res, next) => {
    try {
      res.locals.bannerText = await contentfulService.getBanner(res.locals.user.activeCaseLoadId)

      next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve banner')
      next()
    }
  }
}
