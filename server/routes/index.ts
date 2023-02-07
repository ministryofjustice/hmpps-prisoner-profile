import { type RequestHandler, Router } from 'express'
import config from '../config'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import OverviewPageService from '../services/overviewPageService'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/prisoner/:prisonerNumber', (req, res, next) => {
    OverviewPageService(req.params.prisonerNumber, res)
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
