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
export const kilogramsToStoneAndPounds = (kilograms: number): { stones: number; pounds: number } => {
  const stonesTotal = kilograms / 6.35
  const stones = Math.floor(stonesTotal)
  const pounds = Math.round((stonesTotal % 1) * 14)

  if (pounds === 14) {
    return { stones: stones + 1, pounds: 0 }
  }

  return { stones, pounds }
}

export const stonesAndPoundsToKilograms = (stones: number, pounds: number): number => {
  const stonesTotal = stones + pounds / 14
  return Math.round(stonesTotal * 6.35)
}
