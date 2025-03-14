import { dietAndFoodAllergiesValidator } from './dietAndFoodAllergiesValidator'

describe('Diet And Food Allergies Validator', () => {
  describe('Medical', () => {
    it.each([
      ['MEDICAL_DIET_EATING_DISORDER', 'a'.repeat(100)],
      ['MEDICAL_DIET_EATING_DISORDER'],
      [
        'MEDICAL_DIET_EATING_DISORDER',
        'a'.repeat(101),
        'The type of eating disorder must be 100 characters or less.',
        '#medical-eating-disorder',
      ],
      ['MEDICAL_DIET_NUTRIENT_DEFICIENCY', 'a'.repeat(100)],
      ['MEDICAL_DIET_NUTRIENT_DEFICIENCY'],
      [
        'MEDICAL_DIET_NUTRIENT_DEFICIENCY',
        'a'.repeat(101),
        'The type of deficiency must be 100 characters or less.',
        '#medical-nutrient-deficiency',
      ],
      ['MEDICAL_DIET_OTHER', 'a'.repeat(100)],
      ['MEDICAL_DIET_OTHER', undefined, 'Enter the other medical dietary requirements.', '#medical-other'],
      [
        'MEDICAL_DIET_OTHER',
        'a'.repeat(101),
        'The other medical dietary requirements must be 100 characters or less.',
        '#medical-other',
      ],
    ])(
      'Reference data selection - %s',
      (value, comment = undefined, errorMessage = undefined, errorHref = undefined) => {
        const body = {
          medical: [{ value, comment }],
        }
        const errors = dietAndFoodAllergiesValidator(body)

        if (errorMessage) {
          expect(errors.length).toEqual(1)
          expect(errors[0].text).toEqual(errorMessage)
          expect(errors[0].href).toEqual(errorHref)
        } else {
          expect(errors.length).toEqual(0)
        }
      },
    )
  })

  describe('Food allergy', () => {
    it.each([
      ['FOOD_ALLERGY_OTHER', 'a'.repeat(100)],
      ['FOOD_ALLERGY_OTHER', undefined, 'Enter the other food allergies.', '#allergy-other'],
      [
        'FOOD_ALLERGY_OTHER',
        'a'.repeat(101),
        'The other food allergies must be 100 characters or less.',
        '#allergy-other',
      ],
    ])(
      'Reference data selection - %s',
      (value, comment = undefined, errorMessage = undefined, errorHref = undefined) => {
        const body = {
          allergy: [{ value, comment }],
        }
        const errors = dietAndFoodAllergiesValidator(body)

        if (errorMessage) {
          expect(errors.length).toEqual(1)
          expect(errors[0].text).toEqual(errorMessage)
          expect(errors[0].href).toEqual(errorHref)
        } else {
          expect(errors.length).toEqual(0)
        }
      },
    )
  })

  describe('Personalised diet', () => {
    it.each([
      ['PERSONALISED_DIET_OTHER', 'a'.repeat(100)],
      [
        'PERSONALISED_DIET_OTHER',
        undefined,
        'Enter the other personalised dietary requirements.',
        '#personalised-other',
      ],
      [
        'PERSONALISED_DIET_OTHER',
        'a'.repeat(101),
        'The other personalised dietary requirements must be 100 characters or less.',
        '#personalised-other',
      ],
    ])(
      'Reference data selection - %s',
      (value, comment = undefined, errorMessage = undefined, errorHref = undefined) => {
        const body = {
          personalised: [{ value, comment }],
        }
        const errors = dietAndFoodAllergiesValidator(body)

        if (errorMessage) {
          expect(errors.length).toEqual(1)
          expect(errors[0].text).toEqual(errorMessage)
          expect(errors[0].href).toEqual(errorHref)
        } else {
          expect(errors.length).toEqual(0)
        }
      },
    )
  })

  describe('Catering instructions', () => {
    describe('Other', () => {
      it('Valid data', async () => {
        const body = {
          cateringInstructions: 'a'.repeat(1000),
        }
        const errors = dietAndFoodAllergiesValidator(body)
        expect(errors.length).toEqual(0)
      })

      it('Catering instructions are optional', async () => {
        const body = {}
        const errors = dietAndFoodAllergiesValidator(body)
        expect(errors.length).toEqual(0)
      })

      it('Catering instructions too long', async () => {
        const body = {
          cateringInstructions: 'a'.repeat(1001),
        }
        const errors = dietAndFoodAllergiesValidator(body)
        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual('The catering instructions must be 1000 characters or less.')
        expect(errors[0].href).toEqual('#catering-instructions')
      })
    })
  })
})
