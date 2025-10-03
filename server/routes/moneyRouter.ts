import { Router } from 'express'
import { Services } from '../services'
import MoneyController from '../controllers/moneyController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'

export default function moneyRouter(services: Services): Router {
  const router = Router({ mergeParams: true })

  const moneyController = new MoneyController(services.moneyService, services.auditService)

  router.get('/spends', auditPageAccessAttempt({ services, page: Page.MoneySpends }), moneyController.displaySpends())
  router.get(
    '/private-cash',
    auditPageAccessAttempt({ services, page: Page.MoneyPrivateCash }),
    moneyController.displayPrivateCash(),
  )
  router.get(
    '/savings',
    auditPageAccessAttempt({ services, page: Page.MoneySavings }),
    moneyController.displaySavings(),
  )
  router.get(
    '/damage-obligations',
    auditPageAccessAttempt({ services, page: Page.MoneyDamageObligations }),
    moneyController.displayDamageObligations(),
  )

  return router
}
