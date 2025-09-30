import { RequestHandler, Router } from 'express'

const getRequest =
  (router: Router) =>
  (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(path, ...handlers)

const postRequest =
  (router: Router) =>
  (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(path, ...handlers)

export { getRequest, postRequest }
