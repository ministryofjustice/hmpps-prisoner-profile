import { RequestHandler, Request } from 'express'
import HmppsError from '../interfaces/HmppsError'
import { hasLength } from '../utils/utils'
import { BodySubmission, FileUploadRequest } from '../validators/personal/distinguishingMarksValidator'
import { DietAndFoodAllergiesSubmission } from '../validators/personal/dietAndFoodAllergiesValidator'
import { AddIdentityNumberSubmission } from '../controllers/utils/identityNumbersController/buildIdentityNumberOptions'
import { EditIdentityNumberSubmission } from '../controllers/identityNumbersController'
import { NextOfKinSubmission } from '../controllers/nextOfKinController'

export type Validator = (
  body:
    | FileUploadRequest
    | Record<string, string | string[] | AddIdentityNumberSubmission>
    | BodySubmission
    | DietAndFoodAllergiesSubmission
    | EditIdentityNumberSubmission
    | NextOfKinSubmission,
) => HmppsError[] | Promise<HmppsError[]>

export type RedirectWithParams = (params: Request['params']) => string
export interface ValidationMiddlewareOptions {
  redirectBackOnError: boolean
  redirectTo?: string
  redirectWithParams?: RedirectWithParams
  useReq?: boolean
}

export default function validationMiddleware(
  validators: Validator[],
  options: {
    redirectBackOnError: boolean
    redirectTo?: string
    redirectWithParams?: RedirectWithParams
    useReq?: boolean
  } = {
    redirectBackOnError: false,
    useReq: false,
  },
): RequestHandler {
  // Recursively iterate into an object and trim any strings inside
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deepTrim = (object: any): object => {
    const o = object
    if (o) {
      Object.keys(o).forEach(key => {
        if (typeof o[key] === 'string') {
          o[key] = o[key].trim()
        } else if (typeof o[key] === 'object') {
          o[key] = deepTrim(o[key])
        }
      })
    }
    return o as object
  }

  return async (req, res, next) => {
    req.body = deepTrim(req.body)

    const validationResults = await Promise.all(validators.map(validator => validator(options.useReq ? req : req.body)))
    const errors = validationResults.flat()
    if (hasLength(errors) && options.redirectBackOnError) {
      req.flash('requestBody', JSON.stringify(req.body))
      req.flash('errors', errors)
      if (options.redirectTo) {
        return res.redirect(`/prisoner/${req.params.prisonerNumber}/${options.redirectTo}`)
      }
      if (options.redirectWithParams) {
        return res.redirect(`/prisoner/${req.params.prisonerNumber}/${options.redirectWithParams(req.params)}`)
      }
      return res.redirect(req.originalUrl)
    }

    if (errors.length) {
      req.errors = errors
    }
    return next()
  }
}
