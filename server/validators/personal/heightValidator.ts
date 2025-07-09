import { Validator } from '../../middleware/validationMiddleware'

const containsOnlyNumbers = (str: string) => str.match(/[^\d-]/) === null

export const heightMetricValidator: Validator = (body: Record<string, string>) => {
  const { editField } = body

  if (!containsOnlyNumbers(editField)) {
    return [{ text: 'Enter this person’s height', href: '#height' }]
  }

  const height = editField ? parseInt(editField, 10) : 0

  // Empty input is allowed
  if (editField === '') {
    return []
  }

  if (height < 50 || height > 280) {
    return [{ text: 'Height must be between 50 centimetres and 280 centimetres', href: '#height' }]
  }

  return []
}

export const heightImperialValidator: Validator = (body: Record<string, string>) => {
  const { feet: feetString, inches: inchesString } = body

  if ((feetString && !containsOnlyNumbers(feetString)) || (inchesString && !containsOnlyNumbers(inchesString))) {
    return [{ text: 'Enter this person’s height', href: '#feet' }]
  }

  const feet = feetString ? parseInt(feetString, 10) : 0
  const inches = inchesString ? parseInt(inchesString, 10) : 0

  // Empty input is allowed for both or inches only
  if ((!feetString && !inchesString) || (feetString && !inchesString)) {
    return []
  }

  if (!feetString || (feet >= 1 && feet <= 9 && (inches < 0 || inches > 11))) {
    return [{ text: 'Feet must be between 1 and 9. Inches must be between 0 and 11', href: '#feet' }]
  }

  if (feet < 1 || feet > 9 || (feet === 9 && inches > 0)) {
    return [{ text: 'Height must be between 1 feet and 9 feet', href: '#feet' }]
  }

  return []
}
