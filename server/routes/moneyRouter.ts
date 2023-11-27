import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import MoneyController from '../controllers/moneyController'

export default function moneyRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const moneyController = new MoneyController(services.moneyService)

  get('/spends', moneyController.displaySpends())
  get('/private-cash', moneyController.displayPrivateCash())
  get('/savings', moneyController.displaySavings())
  get('/damage-obligations', moneyController.displayDamageObligations())

  return router
}
