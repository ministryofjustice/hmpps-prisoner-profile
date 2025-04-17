import { Router } from 'express'
import { Services } from '../services'
import MoneyController from '../controllers/moneyController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'

export default function moneyRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)

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
