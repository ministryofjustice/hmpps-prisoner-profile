import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import CsraController from '../controllers/csraController'

export default function alertsRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const csraController = new CsraController(services.csraService)

  get(
    '/prisoner/:prisonerNumber/csra-history',
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    (req, res, next) => csraController.displayHistory(req, res, next),
  )

  get(
    '/prisoner/:prisonerNumber/csra-review',
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    (req, res, next) => csraController.displayReview(req, res, next),
  )

  return router
}
