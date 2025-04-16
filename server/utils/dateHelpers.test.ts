import { format, subDays, subMonths, subYears } from 'date-fns'
import {
  ageAsString,
  calculateEndDate,
  dateToIsoDate,
  formatDate,
  formatDateISO,
  formatDateTime,
  formatDateTimeISO,
  formatDateToPattern,
  formatDateWithAge,
  formatDateWithTime,
  isRealDate,
  parseDate,
  timeFormat,
} from './dateHelpers'

describe('formatDateISO', () => {
  it('should return an ISO-8601 date string given a valid date', () => {
    const dateStr = formatDateISO(new Date(2023, 0, 1)) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01')
  })

  it('should return undefined given an invalid date', () => {
    const dateStr = formatDateISO(null)
    expect(dateStr).toBeUndefined()
  })
})

describe('formatDateTimeISO', () => {
  it('should return an ISO-8601 datetime string given a valid date', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 0, 1, 11, 12, 13)) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01T11:12:13')
  })

  it('should return an ISO-8601 datetime string given a valid date', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 6, 1, 11, 12, 13)) // 1 Jan 2023
    expect(dateStr).toEqual('2023-07-01T11:12:13')
  })

  it('should return an ISO-8601 datetime string with time set to 00:00:00 if startOfDay flag is true', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 0, 1, 11, 12, 13), { startOfDay: true }) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01T00:00:00')
  })

  it('should return an ISO-8601 datetime string with time set to 23:59:59 if endOfDay flag is true', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 0, 1, 11, 12, 13), { endOfDay: true }) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01T23:59:59')
  })

  it('should return undefined given an invalid date', () => {
    const dateStr = formatDateTimeISO(undefined)
    expect(dateStr).toBeUndefined()
  })
})

describe('parseDate', () => {
  it.each([
    ['1/1/2001', new Date(2001, 0, 1)],
    ['1/01/2001', new Date(2001, 0, 1)],
    ['01/01/2001', new Date(2001, 0, 1)],
    ['30/11/2001', new Date(2001, 10, 30)],
    ['30-11-2001', new Date(2001, 10, 30)],
    ['30.11.2001', new Date(2001, 10, 30)],
    ['30,11,2001', new Date(2001, 10, 30)],
    ['30 11 2001', new Date(2001, 10, 30)],
  ])('For input %s parse to Date object %s', (date: string, expected: Date) => {
    expect(parseDate(date)).toEqual(expected)
  })

  it.each([[null], [''], ['33/11/2001'], ['30/14/2001'], ['30/11/01'], ['Tuesday']])(
    'For input %s return Invalid Date (NaN)',
    (date: string) => {
      const val = parseDate(date)
      // eslint-disable-next-line no-restricted-globals
      expect(isNaN(val.getTime())).toBeTruthy()
    },
  )
})

describe('isRealDate', () => {
  it.each([
    ['1/1/2001'],
    ['1/01/2001'],
    ['01/01/2001'],
    ['30/11/2001'],
    ['30-11-2001'],
    ['30.11.2001'],
    ['30,11,2001'],
    ['30 11 2001'],
  ])('For input %s expect real date', (date: string) => {
    expect(isRealDate(date)).toBeTruthy()
  })

  it.each([[null], [''], ['33/11/2001'], ['30/14/2001'], ['30/11/01'], ['Tuesday']])(
    'For input %s expect not real date',
    (date: string) => {
      expect(isRealDate(date)).toBeFalsy()
    },
  )
})

describe('format date', () => {
  it.each([
    [null, null, undefined, undefined, ''],
    ['null with return value', null, undefined, 'Not entered', 'Not entered'],
    ['[default]', '2023-01-20', undefined, undefined, '20 January 2023'],
    ['[default]', '2023-01-20', undefined, 'Not entered', '20 January 2023'],
    ['long', '2023-01-20', 'long', undefined, '20 January 2023'],
    ['short', '2023-01-20', 'short', undefined, '20/01/2023'],
    ['full', '2023-01-20', 'full', undefined, 'Friday 20 January 2023'],
    ['medium', '2023-01-20', 'medium', undefined, '20 Jan 2023'],
  ])(
    '%s: formatDate(%s, %s)',
    (
      _: string,
      isoDate: string,
      style: undefined | 'short' | 'full' | 'long' | 'medium',
      emptyReturnValue: string,
      expected: string,
    ) => {
      expect(formatDate(isoDate, style, emptyReturnValue)).toEqual(expected)
    },
  )
})

describe('format datetime', () => {
  it.each([
    [null, null, undefined, ''],
    ['[default]', '2023-01-20T12:13:14', undefined, '20 January 2023 at 12:13'],
    ['long', '2023-01-20T12:13:14', 'long', '20 January 2023 at 12:13'],
    ['short', '2023-01-20T12:13:14', 'short', '20/01/2023 12:13'],
    ['full', '2023-01-20T12:13:14', 'full', 'Friday 20 January 2023 at 12:13'],
    ['medium', '2023-01-20T12:13:14', 'medium', '20 Jan 2023 at 12:13'],
  ])(
    '%s: formatDateTime(%s, %s)',
    (_: string, a: string, b: undefined | 'short' | 'full' | 'long' | 'medium', expected: string) => {
      expect(formatDateTime(a, b)).toEqual(expected)
    },
  )
})

describe('time format', () => {
  it.each([
    ['2023-01-20T12:13:14', '12:13'],
    ['2023-03-23T14:30:14', '14:30'],
    ['2022-01-10T07:45:14', '07:45'],
    ['2020-11-01T19:05:14', '19:05'],
  ])('For input %s parse to Date object %s', (date: string, expected: string) => {
    expect(timeFormat(date)).toEqual(expected)
  })
})

describe('dateToIsoDate', () => {
  it.each([
    ['20/01/2023', '2023-01-20'],
    ['01/12/2023', '2023-12-01'],
  ])('For UI date %s return ISO date %s', (date: string, expected: string) => {
    expect(dateToIsoDate(date)).toEqual(expected)
  })
})

describe('formatDateWithTime', () => {
  it.each([
    ['2023-01-20', '09', '30', '2023-01-20T09:30'],
    ['2023-12-01', '12', '00', '2023-12-01T12:00'],
  ])('Format date %s with time %s %s', (date: string, hours: string, minutes: string, expected: string) => {
    expect(formatDateWithTime(date, hours, minutes)).toEqual(expected)
  })
})

describe('calculateEndDate', () => {
  it.each([
    [new Date('2023-01-02'), 'DAILY', 0, new Date('2023-01-02')],
    [new Date('2023-01-02'), 'DAILY', 1, new Date('2023-01-02')],
    [new Date('2023-01-02'), 'DAILY', 2, new Date('2023-01-03')],
    [new Date('2023-01-02'), 'DAILY', 7, new Date('2023-01-08')],
    [new Date('2023-01-02'), 'WEEKDAYS', 7, new Date('2023-01-10')],
    [new Date('2023-01-02'), 'WEEKLY', 3, new Date('2023-01-16')],
    [new Date('2023-01-02'), 'FORTNIGHTLY', 3, new Date('2023-01-30')],
    [new Date('2023-01-02'), 'MONTHLY', 3, new Date('2023-03-02')],
  ])('Calculate end date from %s %s %s times', (date: Date, repeatPeriod: string, times: number, expected: Date) => {
    expect(calculateEndDate(date, repeatPeriod, times)).toEqual(expected)
  })
})

describe('ageAsString', () => {
  it.each([
    [{ y: 18, m: 0, d: 0 }, '18 years old'],
    [{ y: 1, m: 0, d: 0 }, '1 year old'],
    [{ y: 0, m: 11, d: 0 }, '11 months old'],
    [{ y: 0, m: 1, d: 0 }, '1 month old'],
    [{ y: 0, m: 0, d: 12 }, '12 days old'],
    [{ y: 0, m: 0, d: 1 }, '1 day old'],
  ])('Calculate the age as a string for age %s', ({ y, m, d }, expected) => {
    const dob = subDays(subMonths(subYears(new Date(), y), m), d)
    const result = ageAsString(format(dob, 'yyyy-MM-dd'))
    expect(result).toEqual(expected)
  })

  it('Show not entered message', () => {
    expect(ageAsString(undefined)).toEqual('date of birth not entered')
  })
})

describe('formatDateToPattern', () => {
  it.each([
    ['2023-01-20', 'dd/MM/yyyy', '', '20/01/2023'],
    ['2023-01-20', 'MMMM yyyy', '', 'January 2023'],
    [null, 'dd/MM/yyyy', 'Not entered', 'Not entered'],
  ])('should format %s with pattern %s and return %s', (isoDate, pattern, emptyReturnValue, expected) => {
    expect(formatDateToPattern(isoDate, pattern, emptyReturnValue)).toEqual(expected)
  })
})

describe('formatDateWithAge', () => {
  it.each([
    ['1985-06-15', 'long', '', '15 June 1985 (39 years old)'],
    ['1990-12-01', 'long', '', '1 December 1990 (34 years old)'],
    ['2000-05-20', 'short', '', '20/05/2000 (24 years old)'],
    ['1975-03-10', 'full', '', 'Monday 10 March 1975 (50 years old)'],
    ['1995-09-25', 'medium', '', '25 Sept 1995 (29 years old)'],
    [null, 'long', 'Not entered', 'Not entered'],
    [undefined, 'long', 'Not entered', 'Not entered'],
  ])(
    'should format %s with style %s and emptyReturnValue %s, expect %s',
    (isoDate: string, style: 'short' | 'full' | 'long' | 'medium', emptyReturnValue: string, expected: string) => {
      expect(formatDateWithAge(isoDate, style, emptyReturnValue)).toEqual(expected)
    },
  )
})
