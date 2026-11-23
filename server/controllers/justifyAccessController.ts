import type { Request, RequestHandler, Response } from 'express'
import config from '../config'

/** Presents a form where justification must be entered once per session to access the given high profile prisoner */
// eslint-disable-next-line import/prefer-default-export
export class JustifyAccessController {
  #characterLimit = 250

  get requestHandler(): RequestHandler {
    if (!config.featureToggles.highProfilePrisonersEnabled) {
      return (_req, _res, next) => next()
    }

    return (req, res, next) => {
      if (!('isHighProfilePrisoner' in res.locals)) {
        // requires isHighProfilePrisonerMiddleware middleware
        throw new Error('Usage error: req.locals.isHighProfilePrisoner must be set')
      }

      const { prisonerNumber, isHighProfilePrisoner } = res.locals
      if (!isHighProfilePrisoner) {
        // no need to justify access
        next()
        return
      }
      if (req.session.justifiedHighProfilePrisonerAccess?.[prisonerNumber]) {
        // access already justified
        next()
        return
      }

      if (req.method === 'POST') {
        this.submitForm(req, res)
      } else {
        this.renderTemplate(req, res)
      }
    }
  }

  private submitForm(req: Request, res: Response): void {
    const { prisonerNumber } = res.locals
    const { confirmation, justification } = this.cleanFormValues(req.body)

    const errors = req.errors || []
    if (confirmation !== 'yes') {
      errors.push({
        text: 'Confirm that you have a legitimate business or operational reason to access this profile',
        href: '#confirmation',
      })
    }
    if (justification.length === 0) {
      errors.push({
        text: 'Enter why you need to access this prisoner’s profile',
        href: '#justification',
      })
    } else if (justification.length > this.#characterLimit) {
      errors.push({
        text: `Your explanation must be ${this.#characterLimit} characters or fewer`,
        href: '#justification',
      })
    }

    if (errors.length > 0) {
      req.flash('formValues', { confirmation, justification })
      req.flash('errors', errors)
    } else {
      if (!req.session.justifiedHighProfilePrisonerAccess) {
        req.session.justifiedHighProfilePrisonerAccess = {}
      }
      req.session.justifiedHighProfilePrisonerAccess[prisonerNumber] = justification
    }

    res.redirect(req.originalUrl)
  }

  private renderTemplate(req: Request, res: Response): void {
    const flashMessages = req.flash('formValues') || []
    const formValues: FormValues = {
      justification: '',
    }
    if (flashMessages.length === 1) {
      const { confirmation, justification } = this.cleanFormValues(flashMessages[0] as FormValues)
      formValues.confirmation = confirmation
      formValues.justification = justification
    }

    const errors = req.flash('errors') || []

    res.render('pages/justifyAccess', {
      characterLimit: this.#characterLimit,
      formValues,
      errors,
      backUrl: '/', // TODO: js to use browser back
    })
  }

  private cleanFormValues(data: FormValues): FormValues {
    const { confirmation: confirmationRaw, justification: justificationRaw } = data || {}
    const confirmation = confirmationRaw === 'yes' ? 'yes' : undefined
    const justification = justificationRaw?.trim() ?? ''
    return { confirmation, justification }
  }
}

interface FormValues {
  confirmation?: 'yes'
  justification?: string
}
