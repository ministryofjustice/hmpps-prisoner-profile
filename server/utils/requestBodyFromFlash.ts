import { Request } from 'express'
import { hasLength } from './utils'

export function requestBodyFromFlash<T>(req: Request): T | null {
  const requestBodyFlash = req.flash('requestBody')
  if (hasLength(requestBodyFlash)) {
    return JSON.parse(requestBodyFlash[0]) as T
  }

  return null
}

export default { requestBodyFromFlash }
