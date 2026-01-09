// CM and Feet
export const centimetresToFeetAndInches = (centimetres: number): { feet: number; inches: number } => {
  const feetTotal = centimetres / 2.54 / 12
  const feet = Math.floor(feetTotal)
  const inches = Math.round((feetTotal % 1) * 12)

  if (inches === 12) {
    return { feet: feet + 1, inches: 0 }
  }

  return { feet, inches }
}

export const feetAndInchesToCentimetres = (feet: number, inches: number): number => {
  const inchesTotal = feet * 12 + inches
  return Math.round(inchesTotal * 2.54)
}

// Kg and Stone
export const kilogramsToStoneAndPounds = (kilograms: number): { stone: number; pounds: number; poundsOnly: number } => {
  const stoneTotal = kilograms / 6.35
  const stone = Math.floor(stoneTotal)
  const pounds = Math.round((stoneTotal % 1) * 14)

  return {
    stone: pounds === 14 ? stone + 1 : stone,
    pounds: pounds === 14 ? 0 : pounds,
    poundsOnly: stone * 14 + pounds,
  }
}

export const stoneAndPoundsToKilograms = (stones: number, pounds: number): number => {
  const stoneTotal = stones + pounds / 14
  return Math.round(stoneTotal * 6.35)
}
