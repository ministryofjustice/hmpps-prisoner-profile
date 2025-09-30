import type { RequestHandler } from 'express'

export default function flashMessageMiddleware(): RequestHandler {
  return (req, res, next) => {
    const flashMessage = req.flash('flashMessage')
    res.locals.flashMessage = flashMessage?.length ? flashMessage[0] : undefined

    return next()
  }
}
