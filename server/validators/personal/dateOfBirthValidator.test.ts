import { subYears, format, addYears } from 'date-fns'
import { dateOfBirthValidator } from './dateOfBirthValidator'

describe('dateOfBirthValidator - year range checks', () => {
  const namePrefix = 'testDate'
  const label = 'testDate'

  const getBodyFromDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/')
    return {
      [`${namePrefix}-day`]: day,
      [`${namePrefix}-month`]: month,
      [`${namePrefix}-year`]: year,
    }
  }

  it('returns no errors when date of birth is valid', async () => {
    const validator = dateOfBirthValidator({
      namePrefix,
      label,
    })

    const upperBoundCase = getBodyFromDate(format(subYears(new Date(), 15), 'dd/MM/yyyy'))
    const lowerBoundCase = getBodyFromDate(format(subYears(new Date(), 125), 'dd/MM/yyyy'))

    const upperErrors = await validator(upperBoundCase)
    const lowerErrors = await validator(lowerBoundCase)

    expect(upperErrors).toEqual([])
    expect(lowerErrors).toEqual([])
  })

  it('returns an error if the date of birth is greater than 125 years ago', async () => {
    const validator = dateOfBirthValidator({
      namePrefix,
      label,
    })

    const body = getBodyFromDate(format(subYears(new Date(), 126), 'dd/MM/yyyy'))
    const errors = await validator(body)

    expect(errors).toHaveLength(1)
    expect(errors[0].text).toEqual('This person cannot be older than 125 years old. Enter a valid date of birth')
  })

  it('returns an error if the date of birth is less than 15 years ago', async () => {
    const validator = dateOfBirthValidator({
      namePrefix,
      label,
    })

    const body = getBodyFromDate(format(subYears(new Date(), 14), 'dd/MM/yyyy'))
    const errors = await validator(body)

    expect(errors).toHaveLength(1)
    expect(errors[0].text).toEqual('This person cannot be younger than 15 years old. Enter a valid date of birth')
  })

  it('applies and places priority on the original dateValidator errors', async () => {
    const validator = dateOfBirthValidator({
      namePrefix,
      label,
    })

    const body = getBodyFromDate(format(addYears(new Date(), 1000), 'dd/MM/yyyy'))
    const errors = await validator(body)

    expect(errors).toHaveLength(1)
    expect(errors[0].text).not.toEqual('This person cannot be younger than 15 years old. Enter a valid date of birth')
  })
})
