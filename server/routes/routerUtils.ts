import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'

const getRequest =
  (router: Router) =>
  (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

const postRequest =
  (router: Router) =>
  (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

export { getRequest, postRequest }
