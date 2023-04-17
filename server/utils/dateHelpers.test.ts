import { formatDate, formatDateISO, isRealDate, parseDate } from './dateHelpers'

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
    [null, null, undefined, ''],
    ['[default]', '2023-01-20', undefined, '20 January 2023'],
    ['long', '2023-01-20', 'long', '20 January 2023'],
    ['short', '2023-01-20', 'short', '20/01/2023'],
    ['full', '2023-01-20', 'full', 'Friday, 20 January 2023'],
    ['medium', '2023-01-20', 'medium', '20 Jan 2023'],
  ])(
    '%s: formatDate(%s, %s)',
    (_: string, a: string, b: undefined | 'short' | 'full' | 'long' | 'medium', expected: string) => {
      expect(formatDate(a, b)).toEqual(expected)
    },
  )
})
