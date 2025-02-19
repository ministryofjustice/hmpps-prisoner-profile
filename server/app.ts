import express from 'express'

import path from 'path'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes, { standardGetPaths } from './routes'
import type { Services } from './services'
import populateClientToken from './middleware/populateClientToken'
import setUpPageNotFound from './middleware/setUpPageNotFound'
import flashMessageMiddleware from './middleware/flashMessageMiddleware'
import setUpEnvironmentName from './middleware/setUpEnvironmentName'
import apiErrorMiddleware from './middleware/apiErrorMiddleware'
import bannerMiddleware from './middleware/bannerMiddleware'
import logger from '../logger'
import config from './config'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.dataAccess.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, path)
  setUpEnvironmentName(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware(['ROLE_PRISON']))
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())
  app.use(populateClientToken())
  app.use(flashMessageMiddleware())
  app.use(apiErrorMiddleware())
  app.use(bannerMiddleware(services))

  app.get(
    standardGetPaths,
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
  )
  app.use(dpsComponents.retrieveCaseLoadData({ logger }))
  app.use(routes(services))

  app.use(setUpPageNotFound)
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
