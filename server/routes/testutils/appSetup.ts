import cookieSession from 'cookie-session'
import express, { type Express } from 'express'
import { NotFound } from 'http-errors'

import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import type { HmppsUser } from '../../interfaces/HmppsUser'
import type { ApplicationInfo } from '../../applicationInfo'

export const flashProvider = jest.fn()

function appSetup(services: Services, production: boolean, userSupplier: () => HmppsUser): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, {} as ApplicationInfo)

  app.use(cookieSession({ keys: [''] }))
  app.use((req, res, next) => {
    const user = userSupplier()
    req.user = user
    req.middleware = {
      ...req.middleware,
      clientToken: 'clientToken021',
    }
    req.flash = flashProvider
    res.locals = {
      feComponents: {
        header: 'DPS header',
        footer: 'DPS footer',
        cssIncludes: [],
        jsIncludes: [],
        sharedData: {
          caseLoads: [],
          activeCaseLoad: null,
          services: [],
          allocationJobResponsibilities: [],
          cspDirectives: {},
        },
      },
      user,
    }
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes(services))
  app.use((_req, _res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  userSupplier = () => null,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
} = {}): Express {
  return appSetup(services as Services, production, userSupplier)
}
