import { Validator } from '../../middleware/validationMiddleware'

export const otherLanguageValidator: Validator = (body: Record<string, string>) => {
  const { language, languageError } = body

  const errors = []

  if (!language && !languageError) {
    errors.push({ text: 'Select a language', href: '#language' })
  }

  // Other errors with the selected language input are dealt with in the controller to
  // enable duplicate checks

  return errors
}
