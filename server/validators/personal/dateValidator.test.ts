import { dateValidator } from './dateValidator'

const onlyAllowHistoric = true

describe('Date Validator', () => {
  it.each([
    // Valid
    ['01', '02', '1990', onlyAllowHistoric],
    ['01', '02', '2990', !onlyAllowHistoric],

    // Invalid - not real dates
    ['30', '02', '1990', onlyAllowHistoric, 'Test date must be a real date', '#testDate'],
    ['00', '02', '1990', onlyAllowHistoric, 'Test date must be a real date', '#testDate'],
    ['-1', '02', '1990', onlyAllowHistoric, 'Test date must be a real date', '#testDate'],
    ['01', '13', '1990', onlyAllowHistoric, 'Test date must be a real date', '#testDate'],

    // Still invalid if not checking historic:
    ['01', '13', '1990', !onlyAllowHistoric, 'Test date must be a real date', '#testDate'],
    ['01', '13', '2990', !onlyAllowHistoric, 'Test date must be a real date', '#testDate'],

    // Invalid - future date
    ['01', '02', '2990', onlyAllowHistoric, 'Test date must be in the past', '#testDate'],

    // Invalid - missing day/month/year:
    ['', '02', '1990', onlyAllowHistoric, 'Test date must include a day', '#testDate-day'],
    ['01', '', '1990', onlyAllowHistoric, 'Test date must include a month', '#testDate-month'],
    ['01', '02', '', onlyAllowHistoric, 'Test date must include a year', '#testDate-year'],
    [undefined, '02', '1990', onlyAllowHistoric, 'Test date must include a day', '#testDate-day'],

    // Invalid - missing multiple fields:
    ['', '', '', onlyAllowHistoric, 'Test date missing!', '#testDate'],
    ['', '02', '', onlyAllowHistoric, 'Test date missing!', '#testDate'],
    ['01', '', '', onlyAllowHistoric, 'Test date missing!', '#testDate'],
    ['', '', '1990', onlyAllowHistoric, 'Test date missing!', '#testDate'],
    [undefined, undefined, '1990', onlyAllowHistoric, 'Test date missing!', '#testDate'],
  ])(
    `Date entered - '%s' '%s' '%s'`,
    async (
      day: string,
      month: string,
      year: string,
      checkHistoric: boolean = true,
      errorMessage: string = undefined,
      errorHref: string = undefined,
    ) => {
      const body = {
        'testDate-day': day,
        'testDate-month': month,
        'testDate-year': year,
      }

      const errors = await dateValidator({
        namePrefix: 'testDate',
        label: 'Test date',
        missingText: 'Test date missing!',
        checkHistoric,
      })(body)

      if (errorMessage) {
        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(errorMessage)
        expect(errors[0].href).toEqual(errorHref)
      } else {
        expect(errors.length).toEqual(0)
      }
    },
  )
})
