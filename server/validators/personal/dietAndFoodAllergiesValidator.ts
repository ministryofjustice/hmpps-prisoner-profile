import { Validator } from '../../middleware/validationMiddleware'
import { ReferenceDataIdSelection } from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export const dietAndFoodAllergiesValidator: Validator = (body: Record<string, ReferenceDataIdSelection[]>) => {
  const { medical, allergy, personalised } = body
  const errors = []

  if (medical?.find(item => item.value === 'MEDICAL_DIET_OTHER' && !item.comment)) {
    errors.push({ text: 'Enter the other medical dietary requirements.', href: '#medical-other' })
  }

  if (allergy?.find(item => item.value === 'FOOD_ALLERGY_OTHER' && !item.comment)) {
    errors.push({ text: 'Enter the other food allergies.', href: '#allergy-other' })
  }

  if (personalised?.find(item => item.value === 'PERSONALISED_DIET_OTHER' && !item.comment)) {
    errors.push({ text: 'Enter the other personalised dietary requirements.', href: '#personalised-other' })
  }

  return errors
}
