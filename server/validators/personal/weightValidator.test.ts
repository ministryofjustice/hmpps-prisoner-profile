import { weightImperialValidator, weightMetricValidator } from './weightValidator'

describe('Weight validator', () => {
  describe('Metric', () => {
    it.each([{ kilograms: '' }, { kilograms: '50' }, { kilograms: '12' }, { kilograms: '640' }])(
      'Valid request: %s',
      async ({ kilograms }) => {
        const body = { kilograms }
        const errors = await weightMetricValidator(body)
        expect(errors.length).toEqual(0)
      },
    )

    it.each([
      [{ kilograms: '-1' }, 'Weight must be between 12 kilograms and 640 kilograms'],
      [{ kilograms: '11' }, 'Weight must be between 12 kilograms and 640 kilograms'],
      [{ kilograms: '651' }, 'Weight must be between 12 kilograms and 640 kilograms'],
      [{ kilograms: 'Example' }, 'Weight must only contain numbers'],
      [{ kilograms: '12example' }, 'Weight must only contain numbers'],
    ])('Validations: %s: %s', async ({ kilograms }: { kilograms: string }, errorMessage: string) => {
      const body = { kilograms }
      const errors = await weightMetricValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual('#kilograms')
    })
  })

  describe('Imperial', () => {
    describe('Stone and pounds', () => {
      it.each([
        { stone: '', pounds: '' },
        { stone: '5', pounds: '2' },
        { stone: '3', pounds: '' },
      ])('Valid request: %s', async ({ stone, pounds }) => {
        const body = { stone, pounds, imperialWeightOption: 'stoneAndPounds' }
        const errors = await weightImperialValidator(body)
        expect(errors.length).toEqual(0)
      })

      it.each([
        // Invalid input
        [{ stone: 'example', pounds: '1' }, 'Weight must only contain numbers'],
        [{ stone: '12example', pounds: '1' }, 'Weight must only contain numbers'],
        [{ stone: '10', pounds: 'example' }, 'Weight must only contain numbers'],
        [{ stone: '10', pounds: '12example' }, 'Weight must only contain numbers'],

        // Stone limits
        [{ stone: '1', pounds: '5' }, 'Weight must be between 2 stone and 100 stone'],
        [{ stone: '101', pounds: '5' }, 'Weight must be between 2 stone and 100 stone'],

        // Pounds limits
        [{ stone: '25', pounds: '-1' }, 'Stone must be between 2 and 100. Pounds must be between 0 and 13'],
        [{ stone: '25', pounds: '14' }, 'Stone must be between 2 and 100. Pounds must be between 0 and 13'],

        // Empty stone
        [{ stone: '', pounds: '1' }, 'Stone must be between 2 and 100. Pounds must be between 0 and 13'],
      ])('Validations: %s: %s', async ({ stone, pounds }: { stone: string; pounds: string }, errorMessage: string) => {
        const body = { stone, pounds, imperialWeightOption: 'stoneAndPounds' }
        const errors = await weightImperialValidator(body)

        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(errorMessage)
        expect(errors[0].href).toEqual('#stone')
      })
    })

    describe('Pounds only', () => {
      it.each([{ poundsOnly: '' }, { poundsOnly: '150' }, { poundsOnly: '28' }, { poundsOnly: '1400' }])(
        'Valid request: %s',
        async ({ poundsOnly }) => {
          const body = { poundsOnly, imperialWeightOption: 'poundsOnly' }
          const errors = await weightImperialValidator(body)
          expect(errors.length).toEqual(0)
        },
      )

      it.each([
        [{ poundsOnly: 'example' }, 'Weight must only contain numbers'],
        [{ poundsOnly: '150example' }, 'Weight must only contain numbers'],

        // Limits:
        [{ poundsOnly: '27' }, 'Weight must be between 28 and 1400 pounds'],
        [{ poundsOnly: '1401' }, 'Weight must be between 28 and 1400 pounds'],
        [{ poundsOnly: '-150' }, 'Weight must be between 28 and 1400 pounds'],
      ])('Validations: %s: %s', async ({ poundsOnly }: { poundsOnly: string }, errorMessage: string) => {
        const body = { poundsOnly, imperialWeightOption: 'poundsOnly' }
        const errors = await weightImperialValidator(body)

        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(errorMessage)
        expect(errors[0].href).toEqual('#poundsOnly')
      })
    })
  })
})
