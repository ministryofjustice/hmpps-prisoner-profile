import crypto from 'crypto'
import express, { NextFunction, Request, Response, Router } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })

  const scriptSrc = [
    "'self'",
    '*.google-analytics.com',
    '*.analytics.google.com',
    '*.googletagmanager.com',
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]
  const styleSrc = [
    "'self'",
    "'sha256-dCFTgAnPDLgZfSZ6J47SbSdR5C8q8CG0qFjXCTQa9mY='", // hash for svg style in modal.js
    '*.google-analytics.com',
    '*.analytics.google.com',
    '*.googletagmanager.com',
    'fonts.googleapis.com',
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]
  const formAction = [`'self' ${config.apis.hmppsAuth.externalUrl} ${config.serviceUrls.digitalPrison}`]
  const imgSrc = ["'self'", 'data:', '*.google-analytics.com', '*.analytics.google.com', '*.googletagmanager.com']
  const fontSrc = ["'self'"]

  if (config.apis.frontendComponents.url) {
    scriptSrc.push(config.apis.frontendComponents.url)
    styleSrc.push(config.apis.frontendComponents.url)
    imgSrc.push(config.apis.frontendComponents.url)
    fontSrc.push(config.apis.frontendComponents.url)
  }

  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: [
            "'self'",
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.googletagmanager.com',
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
          ],
          formAction,
          scriptSrc,
          styleSrc,
          imgSrc,
          fontSrc,
        },
      },
      crossOriginEmbedderPolicy: { policy: 'credentialless' },
    }),
  )
  return router
}
