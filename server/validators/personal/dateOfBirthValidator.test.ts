import { subYears, format, addYears, subDays, addDays } from 'date-fns'
import { dateOfBirthValidator } from './dateOfBirthValidator'

describe('dateOfBirthValidator - year range checks', () => {
  const namePrefix = 'testDate'
  const label = 'testDate'

  it.each([
    [subDays(subYears(new Date(), 15), 1), null],
    [
      addDays(subYears(new Date(), 15), 1),
      'This person cannot be younger than 15 years old. Enter a valid date of birth',
    ],
    [subYears(new Date(), 125), null],
    [
      subDays(subYears(new Date(), 125), 1),
      'This person cannot be older than 125 years old. Enter a valid date of birth',
    ],
  ])('Date must be in valid range (15 - 125 years): %s', async (date, errorMessage) => {
    const validator = dateOfBirthValidator({
      namePrefix,
      label,
    })

    const body = getBodyFromDate(format(date, 'dd/MM/yyyy'))
    const errors = await validator(body)

    if (errorMessage) {
      expect(errors).toHaveLength(1)
      expect(errors[0].text).toEqual(errorMessage)
    } else {
      expect(errors).toEqual([])
    }
  })

  it('applies and places priority on the original dateValidator errors', async () => {
    const validator = dateOfBirthValidator({
      namePrefix,
      label,
    })

    const body = getBodyFromDate(format(addYears(new Date(), 1000), 'dd/MM/yyyy'))
    const errors = await validator(body)

    expect(errors).toHaveLength(1)
    expect(errors[0].text).toEqual(`${label} must be in the past`)
  })

  const getBodyFromDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/')
    return {
      [`${namePrefix}-day`]: day,
      [`${namePrefix}-month`]: month,
      [`${namePrefix}-year`]: year,
    }
  }
})
