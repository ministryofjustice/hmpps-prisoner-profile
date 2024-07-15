import { Validator } from '../../middleware/validationMiddleware'

export const heightMetricValidator: Validator = body => {
  const { editField } = body

  const height = editField ? parseInt(editField, 10) : 0

  // Empty input is allowed
  if (editField === '') {
    return []
  }

  if (Number.isNaN(height)) {
    return [{ text: "Enter this person's height", href: '#height' }]
  }

  if (height < 50 || height > 280) {
    return [{ text: 'Height must be between 50 centimetres and 280 centimetres', href: '#height' }]
  }

  return []
}

export const heightImperialValidator: Validator = body => {
  const { feet: feetString, inches: inchesString } = body

  const feet = feetString ? parseInt(feetString, 10) : 0
  const inches = inchesString ? parseInt(inchesString, 10) : 0

  // Empty input is allowed for both or inches only
  if ((!feetString && !inchesString) || (feetString && !inchesString)) {
    return []
  }

  if (Number.isNaN(feet) || Number.isNaN(inches)) {
    return [{ text: "Enter this person's height", href: '#feet' }]
  }

  if (!feetString || (feet >= 1 && feet <= 9 && inches < 0)) {
    return [{ text: 'Feet must be between 1 and 9. Inches must be between 0 and 11', href: '#feet' }]
  }

  if (feet < 1 || feet > 9 || (feet === 9 && inches > 0)) {
    return [{ text: 'Height must be between 1 feet and 9 feet', href: '#feet' }]
  }

  return []
}
