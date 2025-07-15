import { RequestHandler } from 'express'

export default function unless(checks: ((path: string) => boolean)[], middleware: RequestHandler): RequestHandler {
  return (req, res, next) => {
    let skip = false
    checks.forEach(check => {
      if (check(req.path)) skip = true
    })

    return skip ? next() : middleware(req, res, next)
  }
}
