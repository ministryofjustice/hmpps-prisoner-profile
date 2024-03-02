import type { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'

export default function pageErrorMiddleware(): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    res.locals.pageErrorCallback = (_error: Error) => {
      res.locals.pageHasErrors = true
    }

    return next()
  })
}
