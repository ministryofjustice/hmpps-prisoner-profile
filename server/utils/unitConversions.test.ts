import {
  centimetresToFeetAndInches,
  feetAndInchesToCentimetres,
  kilogramsToStoneAndPounds,
  stonesAndPoundsToKilograms,
} from './unitConversions'

describe('Unit conversions', () => {
  describe('CM/Feet', () => {
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

  describe('KG/Stone', () => {
    describe('Kilograms to stones and pounds', () => {
      it.each([
        [null, { stones: 0, pounds: 0 }],
        [60, { stones: 9, pounds: 6 }],
        [63, { stones: 9, pounds: 13 }],
        [63.4, { stones: 10, pounds: 0 }],
        [63.5, { stones: 10, pounds: 0 }],
        [64, { stones: 10, pounds: 1 }],
      ])('%s kg -> %s', (kilograms: number, expectedResult: { stones: number; pounds: number }) => {
        expect(kilogramsToStoneAndPounds(kilograms)).toEqual(expectedResult)
      })
    })

    describe('Stones and pounds to Kilograms', () => {
      it.each([
        [{ stones: 0, pounds: 0 }, 0],
        [{ stones: 9, pounds: 6 }, 60],
        [{ stones: 9, pounds: 13 }, 63],
        [{ stones: 10, pounds: 0 }, 64],
      ])('%s -> %s kg', ({ stones, pounds }: { stones: number; pounds: number }, expectedResult) => {
        expect(stonesAndPoundsToKilograms(stones, pounds)).toEqual(expectedResult)
      })
    })
  })
})
