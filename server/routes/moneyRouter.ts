import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import MoneyController from '../controllers/moneyController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'

export default function moneyRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const moneyController = new MoneyController(services.moneyService, services.auditService)

  get('/spends', auditPageAccessAttempt({ services, page: Page.MoneySpends }), moneyController.displaySpends())
  get(
    '/private-cash',
    auditPageAccessAttempt({ services, page: Page.MoneyPrivateCash }),
    moneyController.displayPrivateCash(),
  )
  get('/savings', auditPageAccessAttempt({ services, page: Page.MoneySavings }), moneyController.displaySavings())
  get(
    '/damage-obligations',
    auditPageAccessAttempt({ services, page: Page.MoneyDamageObligations }),
    moneyController.displayDamageObligations(),
  )

  return router
}
