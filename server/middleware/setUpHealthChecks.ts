import express, { Router } from 'express'

import { endpointHealthComponent, monitoringMiddleware } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig
      .map(([name, configuration]) => [name, configuration] as [string, Record<string, unknown>])
      .filter(([_name, configuration]) => configuration.healthPath !== undefined)
      .map(([name, configuration]) =>
        endpointHealthComponent(logger, name, {
          url: configuration.url as string,
          healthPath: configuration.healthPath as string,
          agentConfig: configuration.agent,
        }),
      ),
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
