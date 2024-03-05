import type { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'

export default function apiErrorMiddleware(): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    res.locals.apiErrorCallback = (_error: Error) => {
      res.locals.pageHasApiErrors = true
    }

    return next()
  })
}
