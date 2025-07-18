import { heightImperialValidator, heightMetricValidator } from './heightValidator'

describe('Height validators', () => {
  describe('Metric', () => {
    it.each([{ editField: '' }, { editField: '100' }])('Valid request: %s', async ({ editField }) => {
      const body = { editField }
      const errors = await heightMetricValidator(body)
      expect(errors.length).toEqual(0)
    })

    it.each([
      ['-1', 'Height must be between 50 centimetres and 280 centimetres'],
      ['49', 'Height must be between 50 centimetres and 280 centimetres'],
      ['281', 'Height must be between 50 centimetres and 280 centimetres'],
      ['Example', 'Height must only contain numbers'],
    ])('Validations: %s: %s', async (value: string, errorMessage: string) => {
      const body = { editField: value }
      const errors = await heightMetricValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual('#height')
    })
  })

  describe('Imperial', () => {
    it.each([
      { feet: '', inches: '' },
      { feet: '5', inches: '2' },
      { feet: '3', inches: '' },
    ])('Valid: %s', async ({ feet, inches }) => {
      const body = { feet, inches }
      const errors = await heightImperialValidator(body)
      expect(errors.length).toEqual(0)
    })

    it.each([
      [{ feet: '0', inches: '11' }, 'Height must be between 1 feet and 9 feet'],
      [{ feet: '9', inches: '1' }, 'Height must be between 1 feet and 9 feet'],
      [{ feet: '12', inches: '1' }, 'Height must be between 1 feet and 9 feet'],
      [{ feet: '', inches: '1' }, 'Feet must be between 1 and 9. Inches must be between 0 and 11'],
      [{ feet: 'example', inches: '1' }, 'Height must only contain numbers'],
      [{ feet: '12example', inches: '1' }, 'Height must only contain numbers'],
      [{ feet: '1', inches: '12example' }, 'Height must only contain numbers'],
      [{ feet: '5', inches: 'example' }, 'Height must only contain numbers'],
      [{ feet: '-5', inches: '1' }, 'Height must be between 1 feet and 9 feet'],
      [{ feet: '1', inches: '-5' }, 'Feet must be between 1 and 9. Inches must be between 0 and 11'],
      [{ feet: '1', inches: '13' }, 'Feet must be between 1 and 9. Inches must be between 0 and 11'],
    ])('Validations: %s: %s', async ({ feet, inches }: { feet: string; inches: string }, errorMessage: string) => {
      const body = { feet, inches }
      const errors = await heightImperialValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual('#feet')
    })
  })
})
