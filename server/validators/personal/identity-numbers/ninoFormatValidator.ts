import HmppsError from '../../../interfaces/HmppsError'

const ninoFormatValidator = (value: string, href: string): HmppsError[] => {
  if (!value) return []

  const nino = value.toUpperCase().replace(/\s/g, '')
  const ninoRegex = /^(?!BG|GB|KN|NK|NT|TN|ZZ|OO|FY|NC|PZ|PY)[ABCEGHJKLMNOPRSTWXYZ][ABCEGHJKLMNPRSTWXYZ]\d{6}[A-D]$/

  if (/[^a-zA-Z0-9 ]/.test(value) || nino === 'PP999999P' || !ninoRegex.test(nino)) {
    return [{ text: 'Enter a valid National Insurance number in the correct format', href }]
  }

  return []
}

export default ninoFormatValidator
