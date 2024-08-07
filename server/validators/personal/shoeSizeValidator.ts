import { Validator } from '../../middleware/validationMiddleware'

export const shoeSizeValidator: Validator = body => {
  const { shoeSize: shoeSizeInput } = body

  if (!shoeSizeInput) return []

  const shoeSize = Number(shoeSizeInput)

  if (Number.isNaN(shoeSize)) {
    return [{ text: "Enter this person's shoe size", href: '#shoeSize' }]
  }

  if (shoeSize < 1 || shoeSize > 25 || shoeSize % 0.5 !== 0) {
    return [{ text: 'Enter a whole or half number between 1 and 25', href: '#shoeSize' }]
  }

  return []
}
