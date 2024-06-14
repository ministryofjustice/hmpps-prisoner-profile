import type { RequestHandler } from 'express'

import logger from '../../logger'
import { Services } from '../services'

export default function getFrontendComponents(
  { componentService, featureToggleService }: Services,
  useLatest: boolean,
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { header, footer, meta } = await componentService.getComponents(
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

      res.locals.feComponentsMeta = meta

      /* Set feature toggle for using Alerts API */
      if ('activeCaseLoadId' in res.locals.user) {
        await featureToggleService.setFeatureToggle(
          res.locals.user.activeCaseLoadId,
          'alertsApiEnabled',
          meta?.services?.some(service => service.id === 'alerts'),
        )
      }

      next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
      next()
    }
  }
}
