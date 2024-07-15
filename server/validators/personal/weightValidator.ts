import { Validator } from '../../middleware/validationMiddleware'

export const weightMetricValidator: Validator = body => {
  const { kilograms } = body
  const weight = parseInt(kilograms, 10)

  // Empty input is allowed
  if (kilograms === '') {
    return []
  }

  if (Number.isNaN(weight)) {
    return [{ text: "Enter this person's weight", href: '#kilograms' }]
  }

  if (weight < 12 || weight > 640) {
    return [{ text: 'Weight must be between 12 kilograms and 640 kilograms', href: '#kilograms' }]
  }

  return []
}

export const weightImperialValidator: Validator = body => {
  const { stone: stoneString, pounds: poundsString } = body

  const stone = stoneString ? parseInt(stoneString, 10) : 0
  const pounds = poundsString ? parseInt(poundsString, 10) : 0

  // Empty input is allowed for both or pounds only
  if ((!stoneString && !poundsString) || (stoneString && !poundsString)) {
    return []
  }

  if (Number.isNaN(stone) || Number.isNaN(pounds)) {
    return [{ text: "Enter this person's weight", href: '#stone' }]
  }

  if (!stoneString || (stone >= 2 && stone <= 100 && (pounds < 0 || pounds > 13))) {
    return [{ text: 'Stone must be between 2 and 100. Pounds must be between 0 and 13', href: '#stone' }]
  }

  if (stone < 2 || stone > 100 || (stone === 100 && pounds > 0)) {
    return [{ text: 'Weight must be between 2 stone and 100 stone', href: '#stone' }]
  }

  return []
}
