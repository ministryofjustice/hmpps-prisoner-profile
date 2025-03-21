import { RequestHandler } from 'express'
import HmppsError from '../interfaces/HmppsError'
import { hasLength } from '../utils/utils'
import { BodySubmission, FileUploadRequest } from '../validators/personal/distinguishingMarksValidator'
import { DietAndFoodAllergiesSubmission } from '../validators/personal/dietAndFoodAllergiesValidator'

export type Validator = (
  body: FileUploadRequest | Record<string, string> | BodySubmission | DietAndFoodAllergiesSubmission,
) => HmppsError[] | Promise<HmppsError[]>

export default function validationMiddleware(
  validators: Validator[],
  options: { redirectBackOnError: boolean; redirectTo?: string; useReq?: boolean } = {
    redirectBackOnError: false,
    useReq: false,
  },
): RequestHandler {
  return async (req, res, next) => {
    const validationResults = await Promise.all(validators.map(validator => validator(options.useReq ? req : req.body)))
    const errors = validationResults.flat()
    if (hasLength(errors) && options.redirectBackOnError) {
      req.flash('requestBody', JSON.stringify(req.body))
      req.flash('errors', errors)
      if (options.redirectTo) {
        return res.redirect(`/prisoner/${req.params.prisonerNumber}/${options.redirectTo}`)
      }
      return res.redirect(req.originalUrl)
    }

    if (errors.length) {
      req.errors = errors
    }
    return next()
  }
}
