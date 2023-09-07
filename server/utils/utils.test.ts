import {
  addressToLines,
  apostrophe,
  arrayToQueryString,
  convertToTitleCase,
  findError,
  formatCategoryCodeDescription,
  formatLocation,
  formatMoney,
  formatName,
  formatScheduleItem,
  getNamesFromString,
  initialiseName,
  isTemporaryLocation,
  mapToQueryString,
  neurodiversityEnabled,
  prependBaseUrl,
  prependHmppsAuthBaseUrl,
  prisonerBelongsToUsersCaseLoad,
  prisonerIsOut,
  prisonerIsTRN,
  properCaseName,
  sortArrayOfObjectsByDate,
  SortType,
  summaryListOneHalfWidth,
  SummaryListRow,
  userHasRoles,
  yearsBetweenDateStrings,
  toNonAssociationRows,
} from './utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { Address } from '../interfaces/address'
import { HmppsError } from '../interfaces/hmppsError'
import { CaseLoad } from '../interfaces/caseLoad'

import config from '../config'
import {
  xrayCareNeedsASCMock,
  xrayCareNeedsDESCMock,
  xrayCareNeedsMock,
} from '../data/localMockData/personalCareNeedsMock'

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

describe('format schedule item', () => {
  it.each([
    [{ name: 'Test item', startTime: '00:00', endTime: '12:00' }, '00:00 to 12:00'],
    [{ name: 'Second test item', startTime: '12:34', endTime: '23:45' }, '12:34 to 23:45'],
    [{ name: 'Item with no end time', startTime: '12:34', endTime: '' }, '12:34'],
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

describe('dateStringToAge', () => {
  it.each([
    ['2020-01-10', '2023-10-31', 3],
    ['2020-01-10', '2020-01-01', 0],
    ['2020-01-10', '2023-01-11', 3],
    ['2020-01-10', '2023-01-10', 3],
    ['2020-01-10', '2023-01-09', 2],
  ])('Number of years between %s and %s - %s', (startDate: string, endDate: string, expectedYears: number) => {
    expect(yearsBetweenDateStrings(startDate, endDate)).toEqual(expectedYears)
  })
})

describe('format name', () => {
  it.each([
    ['All names proper (no options)', 'John', 'James', 'Smith', undefined, 'John James Smith'],
    ['All names lower (no options)', 'john', 'james', 'smith', undefined, 'John James Smith'],
    ['All names upper (no options)', 'JOHN', 'JAMES', 'SMITH', undefined, 'John James Smith'],
    ['No middle names (no options)', 'JOHN', undefined, 'Smith', undefined, 'John Smith'],
    [
      'Multiple middle names (no options)',
      'John',
      'James GORDON william',
      'Smith',
      undefined,
      'John James Gordon William Smith',
    ],
    ['Hyphen (no options)', 'John', undefined, 'SMITH-JONES', undefined, 'John Smith-Jones'],
    ['Apostrophe (no options)', 'JOHN', 'JAMES', "o'reilly", undefined, "John James O'Reilly"],
    [
      'All names (LastCommaFirstMiddle)',
      'John',
      'James',
      'Smith',
      { style: NameFormatStyle.lastCommaFirstMiddle },
      'Smith, John James',
    ],
    [
      'First and last names (LastCommaFirstMiddle)',
      'John',
      undefined,
      'Smith',
      { style: NameFormatStyle.lastCommaFirstMiddle },
      'Smith, John',
    ],
    ['All names (LastCommaFirst)', 'John', 'James', 'Smith', { style: NameFormatStyle.lastCommaFirst }, 'Smith, John'],
    [
      'First name and last name (LastCommaFirst)',
      'John',
      undefined,
      'Smith',
      { style: NameFormatStyle.firstLast },
      'John Smith',
    ],
  ])(
    '%s: formatName(%s, %s, %s, %s)',
    (
      _: string,
      firstName: string,
      middleNames: string,
      lastName: string,
      options: { style: NameFormatStyle },
      expected: string,
    ) => {
      expect(formatName(firstName, middleNames, lastName, options)).toEqual(expected)
    },
  )
})

describe('Address to lines', () => {
  it('Maps a full address', () => {
    const address: Address = {
      flat: '7',
      premise: 'premises address',
      street: 'street field',
      locality: 'locality field',
      town: 'Leeds',
      postalCode: 'LS1 AAA',
      county: 'West Yorkshire',
      country: 'England',
    }

    const lines = addressToLines(address)
    expect(lines[0]).toEqual('Flat 7, premises address, street field')
    expect(lines[1]).toEqual('Leeds')
    expect(lines[2]).toEqual('West Yorkshire')
    expect(lines[3]).toEqual('LS1 AAA')
    expect(lines[4]).toEqual('England')
  })

  it('Maps a partial address', () => {
    const address: Address = {
      premise: 'premises address',
      street: 'street field',
      locality: 'locality field',
      postalCode: 'LS1 AAA',
      county: 'West Yorkshire',
      country: 'England',
    }

    const lines = addressToLines(address)
    expect(lines[0]).toEqual('premises address, street field')
    expect(lines[1]).toEqual('West Yorkshire')
    expect(lines[2]).toEqual('LS1 AAA')
    expect(lines[3]).toEqual('England')
  })
})

describe('findError', () => {
  it('should return an error from a list of errors', () => {
    const errors: HmppsError[] = [
      { text: 'My error', href: '#myError' },
      { text: 'Some other error', href: '#otherError' },
    ]
    const error = findError(errors, 'myError')
    expect(error.text).toEqual('My error')
  })

  it('should return null if error is not in a list of errors', () => {
    const errors: HmppsError[] = [
      { text: 'My error', href: '#myError' },
      { text: 'Some other error', href: '#otherError' },
    ]
    const error = findError(errors, 'nonExistentError')
    expect(error).toBeNull()
  })

  it('should return null if there are no errors', () => {
    const errors: HmppsError[] = null
    const error = findError(errors, 'myError')
    expect(error).toBeNull()
  })

  describe('prisonerBelongsToUsersCaseLoad', () => {
    it('Should return true when the user has a caseload matching the prisoner', () => {
      const caseLoads: CaseLoad[] = [
        { caseloadFunction: '', caseLoadId: 'ABC', currentlyActive: false, description: '', type: '' },
        { caseloadFunction: '', caseLoadId: 'DEF', currentlyActive: false, description: '', type: '' },
      ]

      expect(prisonerBelongsToUsersCaseLoad('DEF', caseLoads)).toEqual(true)
    })

    it('Should return false when the user has a caseload that doesnt match the prisoner', () => {
      const caseLoads: CaseLoad[] = [
        { caseloadFunction: '', caseLoadId: 'ABC', currentlyActive: false, description: '', type: '' },
        { caseloadFunction: '', caseLoadId: 'DEF', currentlyActive: false, description: '', type: '' },
      ]

      expect(prisonerBelongsToUsersCaseLoad('123', caseLoads)).toEqual(false)
    })
  })

  describe('userHasRoles', () => {
    it.each([
      { roles: ['GLOBAL_SEARCH'], userRoles: ['GLOBAL_SEARCH'], result: true },
      { roles: ['GLOBAL_SEARCH'], userRoles: ['SOME_ROLE', 'GLOBAL_SEARCH'], result: true },
      { roles: ['GLOBAL_SEARCH'], userRoles: [], result: false },
      { roles: [], userRoles: ['GLOBAL_SEARCH'], result: false },
      { roles: ['GLOBAL_SEARCH', 'SOME_ROLE'], userRoles: ['SOME_ROLE'], result: true },
      { roles: ['GLOBAL_SEARCH'], userRoles: ['ROLE_GLOBAL_SEARCH'], result: true },
      { roles: ['ROLE_GLOBAL_SEARCH'], userRoles: ['GLOBAL_SEARCH'], result: true },
    ])('Should return the correct result when checking user roles', ({ roles, userRoles, result }) => {
      expect(userHasRoles(roles, userRoles)).toEqual(result)
    })
  })

  describe('formatCategoryCodeDescription', () => {
    it.each([
      { code: undefined, categoryText: undefined, result: 'Not entered' },
      { code: null, categoryText: null, result: 'Not entered' },
      { code: 'A', categoryText: 'Cat A', result: 'A' },
      { code: 'B', categoryText: 'Cat B', result: 'B' },
      { code: 'C', categoryText: 'Cat C', result: 'C' },
      { code: 'D', categoryText: 'Cat D', result: 'D' },
      { code: 'I', categoryText: 'Cat I', result: 'Cat I' },
      { code: 'U', categoryText: 'Some text', result: 'Unsentenced' },
      { code: 'P', categoryText: 'text', result: 'A – provisional' },
      { code: 'H', categoryText: 'other text', result: 'A – high' },
    ])('Should return the correct description', ({ code, categoryText, result }) => {
      expect(formatCategoryCodeDescription(code, categoryText)).toEqual(result)
    })
  })

  describe('apostrophe', () => {
    const firstName = 'James'
    const lastName = 'Grant'
    expect(apostrophe(firstName)).toEqual('James’')
    expect(apostrophe(lastName)).toEqual('Grant’s')
  })

  describe('prependBaseUrl', () => {
    const route = '/prisoner'
    expect(prependBaseUrl(route)).toEqual(`${config.serviceUrls.digitalPrison}${route}`)
  })

  describe('prependHmppsAuthBaseUrl', () => {
    const route = '/account-details'
    expect(prependHmppsAuthBaseUrl(route)).toEqual(`${config.apis.hmppsAuth.url}${route}`)
  })

  describe('prisonerIsOut', () => {
    expect(prisonerIsTRN('TRN')).toEqual(true)
    expect(prisonerIsTRN('OUT')).toEqual(false)
  })

  describe('prisonerIsTRN', () => {
    expect(prisonerIsOut('TRN')).toEqual(false)
    expect(prisonerIsOut('OUT')).toEqual(true)
  })

  describe('sortArrayOfObjectsByDate', () => {
    it('Should return array of objects sorted in ascending order', () => {
      expect(sortArrayOfObjectsByDate(xrayCareNeedsMock.personalCareNeeds, 'startDate', SortType.ASC)).toEqual(
        xrayCareNeedsASCMock.personalCareNeeds,
      )
    })
    it('Should return array of objects sorted in descending order', () => {
      expect(sortArrayOfObjectsByDate(xrayCareNeedsMock.personalCareNeeds, 'startDate', SortType.DESC)).toEqual(
        xrayCareNeedsDESCMock.personalCareNeeds,
      )
    })
  })

  describe('sortArrayOfObjectsByDate', () => {
    it('Should return array of objects sorted in ascending order', () => {
      expect(sortArrayOfObjectsByDate(xrayCareNeedsMock.personalCareNeeds, 'startDate', SortType.ASC)).toEqual(
        xrayCareNeedsASCMock.personalCareNeeds,
      )
    })
    it('Should return array of objects sorted in descending order', () => {
      expect(sortArrayOfObjectsByDate(xrayCareNeedsMock.personalCareNeeds, 'startDate', SortType.DESC)).toEqual(
        xrayCareNeedsDESCMock.personalCareNeeds,
      )
    })
  })

  describe.skip('neuroDiversityEnabledPrisons', () => {
    it('Should return true', () => {
      expect(neurodiversityEnabled('NHI')).toEqual(true)
    })
  })

  describe('neuroDiversityDisabledPrisons', () => {
    it('Should return false', () => {
      expect(neurodiversityEnabled('MDI')).toEqual(false)
    })
  })

  describe('isTemporaryLocation()', () => {
    it('should cope with undefined', () => {
      expect(isTemporaryLocation(undefined)).toEqual(false)
    })
    it('should cope with null', () => {
      expect(isTemporaryLocation(null)).toEqual(false)
    })
    it('should ignore normal locations', () => {
      expect(isTemporaryLocation('A1234BC')).toEqual(false)
    })
    it('should detect temporary locations', () => {
      expect(isTemporaryLocation('RECP')).toEqual(true)
      expect(isTemporaryLocation('CSWAP')).toEqual(true)
      expect(isTemporaryLocation('COURT')).toEqual(true)
      expect(isTemporaryLocation('TAP')).toEqual(true)
    })
    it('should detect temporary locations even with prefix', () => {
      expect(isTemporaryLocation('MDI-CSWAP')).toEqual(true)
    })
    it('should not detect temporary locations with suffix', () => {
      expect(isTemporaryLocation('CSWAP-')).toEqual(false)
    })
  })

  describe('formatLocation()', () => {
    it('should cope with undefined', () => {
      expect(formatLocation(undefined)).toEqual(undefined)
    })
    it('should cope with null', () => {
      expect(formatLocation(null)).toEqual(undefined)
    })
    it('should preserve normal location names', () => {
      expect(formatLocation('A1234BC')).toEqual('A1234BC')
    })
    it('should convert RECP,CSWAP,COURT', () => {
      expect(formatLocation('RECP')).not.toEqual('RECP')
      expect(formatLocation('CSWAP')).not.toEqual('CSWAP')
      expect(formatLocation('COURT')).not.toEqual('COURT')
    })
  })

  describe('toNonAssociationRows()', () => {
    it('map non-associations to rows', () => {
      const res = toNonAssociationRows([
        {
          agencyId: 'MDI',
          assignedLivingUnitDescription: 'NMI-RECP',
          nonAssociationName: 'John Doe',
          offenderNo: 'ABC123',
          reasonDescription: 'Victim',
        },
        {
          agencyId: 'MDI',
          assignedLivingUnitDescription: 'NMI-RECP',
          nonAssociationName: 'Guy Incognito',
          offenderNo: 'DEF321',
          reasonDescription: 'Rival Gang',
        },
      ])
      expect(res).toEqual([
        [
          { html: '<a class="govuk-link govuk-link--no-visited-state" href="/prisoner/ABC123">John Doe</a>' },
          { text: 'ABC123' },
          { text: 'NMI-RECP' },
          { text: 'Victim' },
        ],
        [
          { html: '<a class="govuk-link govuk-link--no-visited-state" href="/prisoner/DEF321">Guy Incognito</a>' },
          { text: 'DEF321' },
          { text: 'NMI-RECP' },
          { text: 'Rival Gang' },
        ],
      ])
    })
  })
})
