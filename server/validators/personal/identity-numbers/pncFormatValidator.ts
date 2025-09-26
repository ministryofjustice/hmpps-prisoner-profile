import HmppsError from '../../../interfaces/HmppsError'

const SERIAL_NUM_LENGTH = 7
const LONG_PNC_ID_LENGTH = 10
const VALID_LETTERS = 'ZABCDEFGHJKLMNPQRTUVWXY'
const pncRegex = /^\d{2,4}\/?\d{1,7}[A-Z]$/

export const pncFormatValidator = (value: string, href: string) => {
  const errors: HmppsError[] = []

  const pnc = value?.toUpperCase()?.replace('/', '') || ''
  if (!pncRegex.test(pnc) || !isValid(pnc)) {
    errors.push({
      text: 'Enter a PNC number in the correct format, exactly as it appears on the document',
      href,
    })
  }

  return errors
}

const isValid = (pnc: string) => (isShortFormFormat(pnc) ? shortFormIsValid(pnc) : longFormIsValid(pnc))

const isShortFormFormat = (pnc: string) => pnc.length < LONG_PNC_ID_LENGTH

const shortFormIsValid = (pnc: string): boolean => {
  const checkChar = pnc.slice(-1) // The last character - used for checking validity
  const year = pnc.slice(0, 2) // The year in 2 digit form, e.g. 79
  const serialNum = pnc.slice(2, -1) // the non-year id part 123456Z

  return checkCharIsCorrect(year, serialNum, checkChar)
}

const longFormIsValid = (pnc: string): boolean => {
  const checkChar = pnc.slice(-1) // The last character - used for checking validity
  const year = pnc.slice(2, 4) // The year in 2 digit form, e.g. 79
  const serialNum = pnc.slice(4, -1) // the non-year id part 123456Z

  return checkCharIsCorrect(year, serialNum, checkChar)
}

const checkCharIsCorrect = (shortYear: string, serialNum: string, checkChar: string) => {
  const checkIndex = parseInt(`${shortYear}${padSerialNumber(serialNum)}`, 10) % VALID_LETTERS.length
  return VALID_LETTERS[checkIndex] === checkChar
}

const padSerialNumber = (serialNumber: string): string => serialNumber.padStart(SERIAL_NUM_LENGTH, '0')

export default { pncFormatValidator }
