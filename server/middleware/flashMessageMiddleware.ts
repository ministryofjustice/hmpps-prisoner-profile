import type { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'

export default function flashMessageMiddleware(): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    const flashMessage = req.flash('flashMessage')
    res.locals.flashMessage = flashMessage?.length ? flashMessage[0] : undefined

    return next()
  })
}
