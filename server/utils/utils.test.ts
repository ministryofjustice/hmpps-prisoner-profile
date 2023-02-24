import {
  convertToTitleCase,
  initialiseName,
  formatDate,
  formatScheduleItem,
  summaryListOneHalfWidth,
  SummaryListRow,
  formatMoney,
  properCaseName,
  mapToQueryString,
  getNamesFromString,
  arrayToQueryString,
} from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
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

describe('format schedule item', () => {
  it.each([
    [{ name: 'Test item', startTime: '00:00', endTime: '12:00' }, '00:00 to 12:00'],
    [{ name: 'Second test item', startTime: '12:34', endTime: '23:45' }, '12:34 to 23:45'],
    [{ name: 'Item with no time' }, ''],
  ])('formatScheduleItem(%s)', (scheduleItem, expected) => {
    expect(formatScheduleItem(scheduleItem)).toEqual(expected)
  })
})

describe('summary list one half width', () => {
  it.each([
    ['Empty list', 0],
    ['List of one row', 1],
    ['List of two rows', 2],
  ])('%s: summaryListOneHalfWidth(%s rows)', (_, numberOfRows) => {
    const rows: SummaryListRow[] = []
    for (let i = 0; i < numberOfRows; i += 1) {
      rows.push({ key: { text: i.toString() }, value: { text: i.toString() } })
    }

    const result = summaryListOneHalfWidth(rows)
    result.forEach(row => {
      expect(row.key.classes).toEqual('govuk-!-width-one-half')
      expect(row.value.classes).toEqual('govuk-!-width-one-half')
    })
  })
})

describe('format money', () => {
  it.each([
    [null, undefined, undefined, '£0.00'],
    [null, 'Empty', undefined, 'Empty'],
    [0, undefined, undefined, '£0.00'],
    [1, undefined, undefined, '£1.00'],
    [1.0, undefined, undefined, '£1.00'],
    [2.3, undefined, undefined, '£2.30'],
    [4.56, undefined, undefined, '£4.56'],
  ])('%s: formatMoney(%s, %s, %s)', (val: number, emptyState: string, currencySymbol: string, expected: string) => {
    expect(formatMoney(val, emptyState, currencySymbol)).toEqual(expected)
  })
})

describe('properCaseName', () => {
  it('null string', () => {
    expect(properCaseName(null)).toEqual('')
  })
  it('empty string', () => {
    expect(properCaseName('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(properCaseName('bob')).toEqual('Bob')
  })
  it('Mixed Case', () => {
    expect(properCaseName('GDgeHHdGr')).toEqual('Gdgehhdgr')
  })
  it('Multiple words', () => {
    expect(properCaseName('BOB SMITH')).toEqual('Bob smith')
  })
  it('Hyphenated', () => {
    expect(properCaseName('MONTGOMERY-FOSTER-SMYTH-WALLACE-BOB')).toEqual('Montgomery-Foster-Smyth-Wallace-Bob')
  })
})

describe('mapToQueryParams', () => {
  it('should handle empty maps', () => {
    expect(mapToQueryString({})).toEqual('')
  })

  it('should handle single key values', () => {
    expect(mapToQueryString({ key1: 'val' })).toEqual('key1=val')
  })

  it('should handle non-string, scalar values', () => {
    expect(mapToQueryString({ key1: 1, key2: true })).toEqual('key1=1&key2=true')
  })

  it('should ignore null values', () => {
    expect(mapToQueryString({ key1: 1, key2: null })).toEqual('key1=1')
  })

  it('should handle encode values', () => {
    expect(mapToQueryString({ key1: "Hi, I'm here" })).toEqual("key1=Hi%2C%20I'm%20here")
  })
})

describe('getNamesFromString()', () => {
  it('should split correctly when name is in LAST_NAME, FIRST_NAME format', () => {
    expect(getNamesFromString('SMITH, JOHN')).toEqual(['John', 'Smith'])
  })

  it('should split correctly when name is in FIRST_NAME LASTNAME format', () => {
    expect(getNamesFromString('John smith')).toEqual(['John', 'Smith'])
  })

  it('should return undefined if nothing passed', () => {
    // @ts-expect-error: Test requires invalid types passed in
    expect(getNamesFromString()).toEqual(undefined)
  })
})

describe('arrayToQueryString()', () => {
  it('should split correctly when name is in LAST_NAME, FIRST_NAME format', () => {
    expect(arrayToQueryString(['string'], 'key')).toEqual('key=string')
  })
})
