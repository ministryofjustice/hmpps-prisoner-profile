import { centimetresToFeetAndInches, feetAndInchesToCentimetres } from './unitConversions'

describe('Unit conversions', () => {
  describe('Centimetres to feet and inches', () => {
    it.each([
      [null, { feet: 0, inches: 0 }],
      [100, { feet: 3, inches: 3 }],
      // 4ft 0.425 inches
      [123, { feet: 4, inches: 0 }],
      // 4ft 0.819 inches
      [124, { feet: 4, inches: 1 }],
      // 4ft 11.842 inches -> 5ft
      [152, { feet: 5, inches: 0 }],
      // 5ft 0.236 inches -> 5ft
      [153, { feet: 5, inches: 0 }],
    ])('%s cm -> %s', (centimetres: number, expectedResult: { feet: number; inches: number }) => {
      expect(centimetresToFeetAndInches(centimetres)).toEqual(expectedResult)
    })
  })

  describe('Feet and inches to centimetres', () => {
    it.each([
      // 152.4 cm
      [{ feet: 5, inches: 0 }, 152],
      // 154.94 cm
      [{ feet: 5, inches: 1 }, 155],
    ])('%s -> %s cm', ({ feet, inches }: { feet: number; inches: number }, expectedResult: number) => {
      expect(feetAndInchesToCentimetres(feet, inches)).toEqual(expectedResult)
    })
  })
})
