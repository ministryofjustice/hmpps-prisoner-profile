import express, { Router, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import crypto from 'crypto'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
          // <script nonce="{{ cspNonce }}">
          // or
          // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
          // This ensures only scripts we trust are loaded, and not anything injected into the
          // page by an attacker.
          scriptSrc: [
            "'self'",
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.googletagmanager.com',
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
          ],
          styleSrc: [
            "'self'",
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.googletagmanager.com',
            'fonts.googleapis.com',
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
          ],
          connectSrc: [
            "'self'",
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.googletagmanager.com',
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
          ],
          imgSrc: [
            "'self'",
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.googletagmanager.com',
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
          ],
          fontSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: { policy: 'credentialless' },
    }),
  )
  return router
}
