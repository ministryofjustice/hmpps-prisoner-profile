import express from 'express'

import multer from 'multer'
import { getFrontendComponents, retrieveCaseLoadData } from '@ministryofjustice/hmpps-connect-dps-components'
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
import { warningMiddleware, warningRenderMiddleware } from './middleware/warningMiddleware'
import { distinguishingMarksMulterExceptions } from './routes/distinguishingMarksRouter'
import unless from './utils/unless'
import { setUpSentry, setUpSentryErrorHandler } from './middleware/setUpSentry'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  setUpSentry()
  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.dataAccess.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, services.dataAccess.applicationInfo)
  setUpEnvironmentName(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware(['ROLE_PRISON']))

  /*
    The Multer middleware must run before the csrf middleware in order to handle CSRF tokens properly.
    Multer will only process forms of type multipart/form-data, so it should be fine to run it here globally
    provided we only use multipart forms where we need to upload files.

    If multipart forms are needed in other cases, more specific rules based on path will be required, e.g.
    update the app.use(csrf stuff) to only run for routes which don't contain distinguishing-marks, then set
    up the Multer and CSRF middleware separately within the distinguishing marks router using the unless
    middleware to skip it here as required.
   */
  app.use(
    unless(
      [distinguishingMarksMulterExceptions],
      multer({
        storage: multer.memoryStorage(),
        limits: {
          // File size limits are 200MB
          // Setting this to 300MB because of overhead when encoding as base64 in imgSrc field in imageController
          // Though these limits feel extreme
          fieldSize: 300 * 1024 * 1024,
        },
      }).single('file'),
    ),
  )

  app.use(unless([distinguishingMarksMulterExceptions], setUpCsrf()))

  app.use(setUpCurrentUser())
  app.use(populateClientToken())
  app.use(flashMessageMiddleware())
  app.use(apiErrorMiddleware())
  app.get(standardGetPaths, bannerMiddleware(services))

  app.get(
    standardGetPaths,
    getFrontendComponents({
      logger,
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
      requestOptions: { includeSharedData: true },
    }),
  )

  app.use(retrieveCaseLoadData({ logger, prisonApiConfig: config.apis.prisonApi }))
  app.use(warningRenderMiddleware)
  app.use(routes(services))
  app.use(warningMiddleware(services.metricsService))

  app.use(setUpPageNotFound)
  setUpSentryErrorHandler(app)
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
