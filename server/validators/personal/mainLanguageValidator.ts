import { Validator } from '../../middleware/validationMiddleware'

export const mainLanguageValidator: Validator = (body: Record<string, string>) => {
  const {
    preferredSpokenLanguageCode,
    preferredSpokenLanguageCodeError,
    preferredWrittenLanguageCode,
    preferredWrittenLanguageCodeError,
  } = body

  const errors = []

  // If an invalid value is entered, the code will be '' and the codeError will be populated, so we have to check both
  // to avoid a false positive
  if (!preferredSpokenLanguageCode && !preferredSpokenLanguageCodeError) {
    errors.push({ text: 'Enter this person’s main spoken language', href: '#preferred-spoken-language-code' })
  }
  if (!preferredWrittenLanguageCode && !preferredWrittenLanguageCodeError) {
    errors.push({ text: 'Enter this person’s main written language', href: '#preferred-written-language-code' })
  }

  // Other errors with the selected language input are dealt with in the controller to
  // enable duplicate checks

  return errors
}

export default { mainLanguageValidator }
