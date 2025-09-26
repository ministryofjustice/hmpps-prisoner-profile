import HmppsError from '../../../interfaces/HmppsError'

const SERIAL_NUM_LENGTH = 6
const VALID_LETTERS = 'ZABCDEFGHJKLMNPQRTUVWXY'
const croRegex = /^\d{1,6}\/\d{2}[A-Z]$/
const croSfRegex = /^SF\d{2}\/\d{1,6}[A-Z]$/

export const croFormatValidator = (value: string, href: string) => {
  const errors: HmppsError[] = []

  const cro = value?.toUpperCase() || ''
  if ((!croRegex.test(cro) && !croSfRegex.test(cro)) || !isValid(cro)) {
    errors.push({
      text: 'Enter a CRO number in the correct format, exactly as it appears on the document',
      href,
    })
  }

  return errors
}

const isValid = (cro: string) => (croSfRegex.test(cro) ? shortFormIsValid(cro) : standardFormIsValid(cro))

const shortFormIsValid = (cro: string): boolean => {
  const checkChar = cro.slice(-1) // The last character - used for checking validity
  const [year, serialNum] = cro.slice(2, -1).split('/') // Splits into [YY, NNNNNN] and drops the check char

  return checkCharIsCorrect(year, serialNum, checkChar)
}

const standardFormIsValid = (cro: string): boolean => {
  const checkChar = cro.slice(-1) // The last character - used for checking validity
  const [serialNum, year] = cro.slice(0, -1).split('/') // Splits into [NNNNNN, YY] and drops the check char

  return checkCharIsCorrect(year, padSerialNumber(serialNum), checkChar)
}

const checkCharIsCorrect = (shortYear: string, serialNum: string, checkChar: string) => {
  const checkIndex = parseInt(`${shortYear}${serialNum}`, 10) % VALID_LETTERS.length
  return VALID_LETTERS[checkIndex] === checkChar
}

const padSerialNumber = (serialNumber: string): string => serialNumber.padStart(SERIAL_NUM_LENGTH, '0')

export default { croFormatValidator }
