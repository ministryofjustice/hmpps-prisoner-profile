import { ReferenceDataIdSelection } from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export interface DietAndFoodAllergiesSubmission {
  medical?: ReferenceDataIdSelection[]
  allergy?: ReferenceDataIdSelection[]
  personalised?: ReferenceDataIdSelection[]
  cateringInstructions?: string
}

export function dietAndFoodAllergiesValidator(body: DietAndFoodAllergiesSubmission) {
  const { medical, allergy, personalised, cateringInstructions } = body
  const errors = []

  if (medical?.find(item => item.value === 'MEDICAL_DIET_OTHER' && !item.comment)) {
    errors.push({ text: 'Enter the other medical dietary requirements.', href: '#medical-other' })
  }

  if (medical?.find(item => item.value === 'MEDICAL_DIET_OTHER' && item.comment && item.comment.length > 100)) {
    errors.push({
      text: 'The other medical dietary requirements must be 100 characters or less.',
      href: '#medical-other',
    })
  }

  if (
    medical?.find(item => item.value === 'MEDICAL_DIET_EATING_DISORDER' && item.comment && item.comment.length > 100)
  ) {
    errors.push({
      text: 'The type of eating disorder must be 100 characters or less.',
      href: '#medical-eating-disorder',
    })
  }

  if (
    medical?.find(
      item => item.value === 'MEDICAL_DIET_NUTRIENT_DEFICIENCY' && item.comment && item.comment.length > 100,
    )
  ) {
    errors.push({
      text: 'The type of deficiency must be 100 characters or less.',
      href: '#medical-nutrient-deficiency',
    })
  }

  if (allergy?.find(item => item.value === 'FOOD_ALLERGY_OTHER' && !item.comment)) {
    errors.push({ text: 'Enter the other food allergies.', href: '#allergy-other' })
  }

  if (allergy?.find(item => item.value === 'FOOD_ALLERGY_OTHER' && item.comment && item.comment.length > 100)) {
    errors.push({ text: 'The other food allergies must be 100 characters or less.', href: '#allergy-other' })
  }

  if (personalised?.find(item => item.value === 'PERSONALISED_DIET_OTHER' && !item.comment)) {
    errors.push({ text: 'Enter the other personalised dietary requirements.', href: '#personalised-other' })
  }

  if (
    personalised?.find(item => item.value === 'PERSONALISED_DIET_OTHER' && item.comment && item.comment.length > 100)
  ) {
    errors.push({
      text: 'The other personalised dietary requirements must be 100 characters or less.',
      href: '#personalised-other',
    })
  }

  if (cateringInstructions && cateringInstructions.length > 1000) {
    errors.push({
      text: 'The catering instructions must be 1000 characters or less.',
      href: '#catering-instructions',
    })
  }

  return errors
}
