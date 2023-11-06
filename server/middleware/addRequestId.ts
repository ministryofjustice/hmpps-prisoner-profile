import { randomUUID } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

export default function addRequestId() {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.locals.requestId = randomUUID()
    next()
  }
}
