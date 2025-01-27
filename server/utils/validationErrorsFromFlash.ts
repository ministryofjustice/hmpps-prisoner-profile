import { Request } from 'express'
import { hasLength } from './utils'
import HmppsError from '../interfaces/HmppsError'

export function validationErrorsFromFlash(req: Request): HmppsError[] | null {
  const errorFlash = req.flash('errors')
  if (hasLength(errorFlash)) {
    return errorFlash as unknown as HmppsError[]
  }

  return null
}
