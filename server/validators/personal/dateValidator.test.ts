import { dateValidator } from './dateValidator'

const onlyAllowHistoric = true
const checkIsRequired = true

describe('Date Validator', () => {
  it.each([
    // Valid
    ['01', '02', '1990', onlyAllowHistoric, checkIsRequired],
    ['01', '02', '2990', !onlyAllowHistoric, !checkIsRequired],
    ['', '', '', onlyAllowHistoric, !checkIsRequired],
    [undefined, undefined, undefined, onlyAllowHistoric, !checkIsRequired],

    // Invalid - not real dates
    ['30', '02', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must be a real date', '#testDate'],
    ['00', '02', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must be a real date', '#testDate'],
    ['-1', '02', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must be a real date', '#testDate'],
    ['01', '13', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must be a real date', '#testDate'],

    // Invalid - not real dates but not checking historic
    ['01', '13', '1990', !onlyAllowHistoric, checkIsRequired, 'Test date must be a real date', '#testDate'],
    ['01', '13', '2990', !onlyAllowHistoric, checkIsRequired, 'Test date must be a real date', '#testDate'],

    // Invalid - not real dates but not required
    ['30', '02', '1990', onlyAllowHistoric, !checkIsRequired, 'Test date must be a real date', '#testDate'],
    ['-1', '02', '1990', !onlyAllowHistoric, !checkIsRequired, 'Test date must be a real date', '#testDate'],

    // Invalid - future date
    ['01', '02', '2990', onlyAllowHistoric, checkIsRequired, 'Test date must be in the past', '#testDate'],

    // Invalid - future date but not required
    ['01', '02', '2990', onlyAllowHistoric, !checkIsRequired, 'Test date must be in the past', '#testDate'],

    // Invalid - missing day/month/year:
    ['', '02', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must include a day', '#testDate-day'],
    ['01', '', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must include a month', '#testDate-month'],
    ['01', '02', '', onlyAllowHistoric, checkIsRequired, 'Test date must include a year', '#testDate-year'],
    [undefined, '02', '1990', onlyAllowHistoric, checkIsRequired, 'Test date must include a day', '#testDate-day'],

    // Invalid - missing day/month/year but not checking historic:
    ['', '02', '1990', !onlyAllowHistoric, checkIsRequired, 'Test date must include a day', '#testDate-day'],
    ['01', '', '1990', !onlyAllowHistoric, checkIsRequired, 'Test date must include a month', '#testDate-month'],
    ['01', '02', '', !onlyAllowHistoric, checkIsRequired, 'Test date must include a year', '#testDate-year'],

    // Invalid - missing day/month/year but not required:
    ['', '02', '1990', onlyAllowHistoric, !checkIsRequired, 'Test date must include a day', '#testDate-day'],
    ['01', '', '1990', onlyAllowHistoric, !checkIsRequired, 'Test date must include a month', '#testDate-month'],
    ['01', '02', '', onlyAllowHistoric, !checkIsRequired, 'Test date must include a year', '#testDate-year'],

    // Invalid - missing multiple fields:
    ['', '', '', onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    ['', '02', '', onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    ['01', '', '', onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    ['', '', '1990', onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    [undefined, undefined, '1990', onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],

    // Invalid - missing multiple fields but not checking historic:
    ['', '', '', !onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    ['', '02', '', !onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    ['01', '', '', !onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],
    ['', '', '1990', !onlyAllowHistoric, checkIsRequired, 'Test date missing!', '#testDate'],

    // Invalid - missing multiple fields but not required:
    ['', '02', '', onlyAllowHistoric, !checkIsRequired, 'Test date missing!', '#testDate'],
    ['01', '', '', onlyAllowHistoric, !checkIsRequired, 'Test date missing!', '#testDate'],
    ['', '', '1990', onlyAllowHistoric, !checkIsRequired, 'Test date missing!', '#testDate'],
  ])(
    `Date entered - '%s' '%s' '%s'`,
    async (
      day: string,
      month: string,
      year: string,
      checkHistoric: boolean = true,
      isRequired: boolean = true,
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
        isRequired,
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
