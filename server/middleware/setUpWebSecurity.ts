import crypto from 'crypto'
import express, { NextFunction, Request, Response, Router } from 'express'
import helmet from 'helmet'
import config from '../config'

const googleDomains = ['*.google-analytics.com', '*.analytics.google.com', '*.googletagmanager.com']
const azureDomains = ['https://northeurope-0.in.applicationinsights.azure.com', '*.monitor.azure.com']

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
    ...googleDomains,
    ...azureDomains,
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]

  const styleSrc = [
    "'self'",
    ...googleDomains,
    'fonts.googleapis.com',
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]

  const connectSrc = [
    "'self'",
    ...googleDomains,
    ...azureDomains,
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]

  const formAction = [`'self' ${config.apis.hmppsAuth.externalUrl} ${config.serviceUrls.digitalPrison}`]
  const imgSrc = ["'self'", 'data:', ...googleDomains]
  const fontSrc = ["'self'"]

  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc,
          styleSrc,
          connectSrc,
          formAction,
          imgSrc,
          fontSrc,
        },
      },
      crossOriginEmbedderPolicy: { policy: 'credentialless' },
    }),
  )
  return router
}
