import { Validator } from '../../middleware/validationMiddleware'
import HmppsError from '../../interfaces/HmppsError'

const basicPostCodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?)(\d[A-Z]{2})$/i

export const addressValidator =
  ({ ukAddress }: { ukAddress: boolean }): Validator =>
  (body: Record<string, string>) => {
    const errors: HmppsError[] = []
    const {
      houseOrBuildingName,
      houseNumber,
      addressLine1,
      addressLine2,
      townOrCityError,
      countyError,
      postcode,
      country,
      countryError,
    } = body

    if (houseOrBuildingName && houseOrBuildingName.length > 50) {
      errors.push({ text: 'House or building name must be 50 characters or less', href: '#house-or-building-name' })
    }

    if (houseNumber && houseNumber.length > 4) {
      errors.push({ text: 'House number must be 4 characters or less', href: '#house-number' })
    }

    if (addressLine1 && addressLine1.length > 60) {
      errors.push({ text: 'Address line 1 must be 60 characters or less', href: '#address-line-1' })
    }

    if (addressLine2 && addressLine2.length > 35) {
      errors.push({ text: 'Address line 2 must be 35 characters or less', href: '#address-line-2' })
    }

    if (postcode && ukAddress && !basicPostCodeRegex.test(postcode.trim().replaceAll(/[^A-Z0-9]/gi, ''))) {
      errors.push({ text: 'Enter a full UK postcode', href: '#postcode' })
    }

    if (postcode && !ukAddress && postcode.trim().length > 10) {
      errors.push({ text: 'Postcode must be 10 characters or less', href: '#postcode' })
    }

    if (townOrCityError) {
      errors.push({ text: 'Enter a valid town or city', href: '#town-or-city' })
    }

    if (countyError) {
      errors.push({ text: 'Enter a valid county', href: '#county' })
    }

    if (!country && !countryError) {
      errors.push({ text: 'Enter a country', href: '#country' })
    }

    if (countryError) {
      errors.push({ text: 'Enter a valid country', href: '#country' })
    }

    return errors
  }
