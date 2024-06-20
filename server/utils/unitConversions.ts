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
