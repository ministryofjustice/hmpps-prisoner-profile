import { RequestHandler } from 'express'

export default function forGetRequestsMatching(
  checks: ((path: string) => boolean)[],
  middleware: RequestHandler,
): RequestHandler {
  return (req, res, next) => {
    if (req.method === 'GET' && checks.some(check => check(req.path))) {
      return middleware(req, res, next)
    }
    return next()
  }
}
