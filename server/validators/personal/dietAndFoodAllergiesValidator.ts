import { Validator } from '../../middleware/validationMiddleware'

export const dietAndFoodAllergiesValidator: Validator = (body: Record<string, string>) => {
  const { medical, medicalOther, allergies, allergiesOther, personal, personalOther } = body
  const errors = []

  // This check will need to be updated once the values are correct
  if (medical?.includes('MEDICAL_DIET_OTHER') && !medicalOther) {
    errors.push({ text: 'Enter the other medical dietary requirements.', href: '#medical' })
  }

  if (allergies?.includes('FOOD_ALLERGY_OTHER') && !allergiesOther) {
    errors.push({ text: 'Enter the other food allergies.', href: '#allergies' })
  }

  if (personal?.includes('PERSONAL_DIET_OTHER') && !personalOther) {
    errors.push({ text: 'Enter the other personalised dietary requirements.', href: '#personal' })
  }

  return errors
}
