import { capitaliseFirstLetter } from './utils'

export const mapSexualOrientationText = (orientation: string): string => {
  if (!orientation) {
    return 'Not entered'
  }

  const value = orientation.toLowerCase()
  switch (value) {
    case 'not entered':
      return 'Not entered'
    case 'heterosexual / straight':
      return 'Heterosexual or straight'
    case 'gay / lesbian':
      return 'Gay or lesbian'
    case 'not answered':
      return 'They prefer not to say'
    default:
      return capitaliseFirstLetter(value)
  }
}

export default { mapSexualOrientationText }
