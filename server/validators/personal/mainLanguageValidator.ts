import { Validator } from '../../middleware/validationMiddleware'

export const mainLanguageValidator: Validator = (body: Record<string, string>) => {
  const { interpreterRequired } = body

  const errors = []

  if (interpreterRequired === undefined) {
    errors.push({ text: 'Select if an interpreter is required', href: '#interpreterRequired' })
  }

  // Errors with the selected language input are dealt with in the controller to
  // enable duplicate checks

  return errors
}
