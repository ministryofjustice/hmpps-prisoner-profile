import express, { Router } from 'express'

import { endpointHealthComponent, monitoringMiddleware } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const allApiConfig = Object.entries(config.apis)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: allApiConfig.flatMap(([name, apiConfig]) =>
      'healthPath' in apiConfig && (!('enabled' in apiConfig) || apiConfig.enabled)
        ? [
            endpointHealthComponent(logger, name, {
              url: apiConfig.url,
              healthPath: apiConfig.healthPath,
              agentConfig: apiConfig.agent,
            }),
          ]
        : [],
    ),
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
