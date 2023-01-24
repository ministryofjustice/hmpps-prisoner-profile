import {
  convertToTitleCase,
  initialiseName,
  formatDate,
  formatScheduleItem,
  summaryListOneHalfWidth,
  SummaryListRow,
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
