import type { RequestHandler } from 'express'

import logger from '../../logger'
import { Services } from '../services'

export default function getFrontendComponents({ componentService }: Services, useLatest: boolean): RequestHandler {
  return async (req, res, next) => {
    try {
      const { header, footer } = await componentService.getComponents(
        ['header', 'footer'],
        res.locals.user.token,
        useLatest,
      )

      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...header.css, ...footer.css],
        jsIncludes: [...header.javascript, ...footer.javascript],
      }
      next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
      next()
    }
  }
}
