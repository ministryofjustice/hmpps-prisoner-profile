import {
  addDefaultSelectedValue,
  addressToLines,
  addressToSummaryItems,
  apostrophe,
  arrayToQueryString,
  calculateAge,
  camelToSnakeCase,
  convertNameCommaToHuman,
  convertToTitleCase,
  extractLocation,
  findError,
  formatCategoryALabel,
  formatCategoryCodeDescription,
  formatCommunityManager,
  formatHeight,
  formatLocation,
  formatMoney,
  formatName,
  formatNamePart,
  formatPomName,
  formatScheduleItem,
  formatWeight,
  getNamesFromString,
  groupBy,
  includesActiveCaseLoad,
  initialiseName,
  isActiveCaseLoad,
  isInUsersCaseLoad,
  isTemporaryLocation,
  mapToQueryString,
  neurodiversityEnabled,
  objectToSelectOptions,
  prependBaseUrl,
  prependHmppsAuthBaseUrl,
  prisonerIsOut,
  prisonerIsTRN,
  properCaseName,
  refDataToSelectOptions,
  SelectOption,
  snakeToCamelCase,
  sortArrayOfObjectsByDate,
  sortByLatestAndUuid,
  SortType,
  summaryListOneHalfWidth,
  SummaryListRow,
  toNonAssociationRows,
  userHasRoles,
} from './utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import HmppsError from '../interfaces/HmppsError'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'

import config from '../config'
import {
  xrayCareNeedsASCMock,
  xrayCareNeedsDESCMock,
  xrayCareNeedsMock,
} from '../data/localMockData/personalCareNeedsMock'
import ReferenceCode from '../data/interfaces/prisonApi/ReferenceCode'
import CommunityManager from '../data/interfaces/deliusApi/CommunityManager'
import { Addresses } from '../services/interfaces/personalPageService/PersonalPage'
import Address from '../data/interfaces/prisonApi/Address'
import GovSummaryItem from '../interfaces/GovSummaryItem'
import { ExternalUser, PrisonUser, ProbationUser } from '../interfaces/HmppsUser'

describe('utils', () => {
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
      [null, undefined, undefined, undefined, '£0.00'],
      [null, 'Empty', undefined, undefined, 'Empty'],
      [0, undefined, undefined, undefined, '£0.00'],
      [1, undefined, undefined, undefined, '£1.00'],
      [1.0, undefined, undefined, undefined, '£1.00'],
      [2.3, undefined, undefined, undefined, '£2.30'],
      [4.56, undefined, undefined, undefined, '£4.56'],
      [-4.56, undefined, undefined, undefined, '-£4.56'],
      [1, undefined, undefined, true, '£0.01'],
      [50, undefined, undefined, true, '£0.50'],
      [6543, undefined, undefined, true, '£65.43'],
      [-90, undefined, undefined, true, '-£0.90'],
    ])(
      '%s: formatMoney(%s, %s, %s, %s)',
      (val: number, emptyState: string, currency: string, usePence: boolean, expected: string) => {
        expect(formatMoney(val, { emptyState, currency, usePence })).toEqual(expected)
      },
    )
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
    it('should handle null/undefined map', () => {
      expect(mapToQueryString(undefined)).toEqual('')
    })

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
      ['2020-01-01', { years: 0, months: 0 }],
      ['2019-10-01', { years: 0, months: 3 }],
      ['2018-10-01', { years: 1, months: 3 }],
      ['1919-10-01', { years: 100, months: 3 }],
      ['1920-01-01', { years: 100, months: 0 }],
      ['1920-01-05', { years: 100, months: 0 }],
    ])('Number of years and months since %s', (dob: string, expectedAge: { years: number; months: number }) => {
      jest.useFakeTimers().setSystemTime(new Date('2020-01-10'))
      expect(calculateAge(dob)).toEqual(expectedAge)
      jest.useRealTimers()
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
      ['Apostrophe (no options)', 'JOHN', 'JAMES', "O'sullivan", undefined, "John James O'Sullivan"],
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
      [
        'All names (LastCommaFirst)',
        'John',
        'James',
        'Smith',
        { style: NameFormatStyle.lastCommaFirst },
        'Smith, John',
      ],
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

  describe('format name part', () => {
    it.each([
      ['Proper', 'John', 'John'],
      ['Lower', 'john', 'John'],
      ['Upper', 'JOHN', 'John'],
      ['Random', 'ChRiStOPheR', 'Christopher'],
      ['Hyphen', 'SMITH-JONES', 'Smith-Jones'],
      ['Apostrophe', "o'reilly", "O'Reilly"],
      ['Mixed', "o'reilly-SMITH", "O'Reilly-Smith"],
    ])('%s: formatNamePart(%s)', (_: string, name: string, expected: string) => {
      expect(formatNamePart(name)).toEqual(expected)
    })
  })

  describe('convert name comma to human', () => {
    it.each([
      ['Normal', 'Smith, John', 'John Smith'],
      ['Apostrophe', "o'reilly, baba", "Baba O'Reilly"],
      ['Mixed Case', "o'reilly-SMITH, JoHn", "John O'Reilly-Smith"],
    ])('%s: convertNameCommaToHuman(%s)', (_: string, name: string, expected: string) => {
      expect(convertNameCommaToHuman(name)).toEqual(expected)
    })
  })

  describe('Address to lines', () => {
    it('Maps a full address', () => {
      const address: Addresses['address'] = {
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
      const address: Addresses['address'] = {
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

    it('does not return a country on its own', () => {
      const address: Addresses['address'] = {
        country: 'England',
      }

      const lines = addressToLines(address)
      expect(lines).toEqual([])
    })

    it('does return single lines that are not country', () => {
      const address: Addresses['address'] = {
        premise: 'premises address',
      }

      const lines = addressToLines(address)
      expect(lines).toEqual(['premises address'])
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
  })

  describe('isActiveCaseLoad', () => {
    it('Should return true when the prisonId matches the active case load', () => {
      const user = { authSource: 'nomis', activeCaseLoadId: 'ABC' } as PrisonUser
      expect(isActiveCaseLoad('ABC', user)).toEqual(true)
    })

    it('Should return false when the prisonId does not match the active case load', () => {
      const user = { authSource: 'nomis', activeCaseLoadId: 'ABC' } as PrisonUser
      expect(isActiveCaseLoad('DEF', user)).toEqual(false)
    })

    it('Should return false for non prison users', () => {
      const probationUser = { authSource: 'delius' } as ProbationUser
      const externalUser = { authSource: 'external' } as ExternalUser

      expect(isActiveCaseLoad('123', probationUser)).toEqual(false)
      expect(isActiveCaseLoad('123', externalUser)).toEqual(false)
    })
  })

  describe('includesActiveCaseLoad', () => {
    it('Should return true when one of the prisonIds matches the active case load', () => {
      const user = { authSource: 'nomis', activeCaseLoadId: 'ABC' } as PrisonUser
      expect(includesActiveCaseLoad(['ABC', 'DEF'], user)).toEqual(true)
    })

    it('Should return false when non of the prisonIds match the active case load', () => {
      const user = { authSource: 'nomis', activeCaseLoadId: 'ABC' } as PrisonUser
      expect(includesActiveCaseLoad(['DEF', 'GHI'], user)).toEqual(false)
    })

    it('Should return false for non prison users', () => {
      const probationUser = { authSource: 'delius' } as ProbationUser
      const externalUser = { authSource: 'external' } as ExternalUser

      expect(includesActiveCaseLoad(['ABC'], probationUser)).toEqual(false)
      expect(includesActiveCaseLoad(['ABC'], externalUser)).toEqual(false)
    })
  })

  describe('isInUsersCaseLoad', () => {
    it('Should return true when the user has a caseload matching the prisoner', () => {
      const caseLoads: CaseLoad[] = [
        { caseloadFunction: '', caseLoadId: 'ABC', currentlyActive: false, description: '', type: '' },
        { caseloadFunction: '', caseLoadId: 'DEF', currentlyActive: false, description: '', type: '' },
      ]
      const user = { authSource: 'nomis', caseLoads } as PrisonUser

      expect(isInUsersCaseLoad('DEF', user)).toEqual(true)
    })

    it('Should return false when the user has a caseload that doesnt match the prisoner', () => {
      const caseLoads: CaseLoad[] = [
        { caseloadFunction: '', caseLoadId: 'ABC', currentlyActive: false, description: '', type: '' },
        { caseloadFunction: '', caseLoadId: 'DEF', currentlyActive: false, description: '', type: '' },
      ]
      const user = { authSource: 'nomis', caseLoads } as PrisonUser

      expect(isInUsersCaseLoad('123', user)).toEqual(false)
    })

    it('Should return false for non prison users', () => {
      const probationUser = { authSource: 'delius' } as ProbationUser
      const externalUser = { authSource: 'external' } as ExternalUser

      expect(isInUsersCaseLoad('123', probationUser)).toEqual(false)
      expect(isInUsersCaseLoad('123', externalUser)).toEqual(false)
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

  describe('formatCategoryALabel', () => {
    it.each([
      { code: undefined, result: undefined },
      { code: 'A', result: 'Cat A' },
      { code: 'P', result: 'Cat A Provisional' },
      { code: 'H', result: 'Cat A High' },
      { code: 'Q', result: 'Female Restricted' },
      { code: 'V', result: 'YOI Restricted' },
      { code: 'I', result: undefined },
    ])('Should return the correct label', ({ code, result }) => {
      expect(formatCategoryALabel(code)).toEqual(result)
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

  describe('neuroDiversityEnabledPrisons', () => {
    beforeAll(() => {
      config.featureToggles.neurodiversityEnabledPrisons = ['NHI']
    })

    afterAll(() => {
      config.featureToggles.neurodiversityEnabledPrisons = []
    })

    it('Should return true', () => {
      expect(neurodiversityEnabled('NHI')).toEqual(true)
    })

    it('Should return false', () => {
      expect(neurodiversityEnabled('MDI')).toEqual(false)
    })
  })

  describe('isTemporaryLocation', () => {
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

  describe('formatLocation', () => {
    it('should cope with undefined', () => {
      expect(formatLocation(undefined)).toEqual(undefined)
    })

    it('should cope with null', () => {
      expect(formatLocation(null)).toEqual(undefined)
    })

    it('should preserve normal location names', () => {
      expect(formatLocation('MDI-1-1-1')).toEqual('MDI-1-1-1')
    })

    it('should convert RECP,CSWAP,COURT', () => {
      expect(formatLocation('RECP')).toEqual('Reception')
      expect(formatLocation('CSWAP')).toEqual('No cell allocated')
      expect(formatLocation('COURT')).toEqual('Court')
    })
  })

  describe('extractLocation', () => {
    it('should cope with undefined location', () => {
      expect(extractLocation(undefined, 'MDI')).toEqual(undefined)
    })

    it('should cope with undefined agencyId', () => {
      expect(extractLocation('MDI-1-1-1', undefined)).toEqual(undefined)
    })

    it('should cope with null location', () => {
      expect(extractLocation(null, 'MDI')).toEqual(undefined)
    })

    it('should cope with null agencyId', () => {
      expect(extractLocation('MDI-1-1-1', null)).toEqual(undefined)
    })

    it('returns undefined for locations that do not fit expected pattern', () => {
      expect(extractLocation('UNEXPECTED', 'MDI')).toEqual(undefined)
      expect(extractLocation('1-1-1', 'MDI')).toEqual(undefined)
      expect(extractLocation('LEI-1-1-1', 'MDI')).toEqual(undefined)
    })

    it('extracts locations', () => {
      expect(extractLocation('MDI-1-1-1', 'MDI')).toEqual('1-1-1')
    })

    it('should extract RECP,CSWAP,COURT', () => {
      expect(extractLocation('MDI-RECP', 'MDI')).toEqual('Reception')
      expect(extractLocation('MDI-CSWAP', 'MDI')).toEqual('No cell allocated')
      expect(extractLocation('MDI-COURT', 'MDI')).toEqual('Court')
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

  describe('refDataToSelectOptions', () => {
    it('should map ref data objects to select options', () => {
      const refData: ReferenceCode[] = [
        {
          code: 'code1',
          description: 'description1',
          activeFlag: 'Y',
        },
        {
          code: 'code2',
          description: 'description2',
          activeFlag: 'Y',
        },
      ]
      const selectOptions = refDataToSelectOptions(refData)

      expect(selectOptions).toEqual([
        { value: 'code1', text: 'description1' },
        { value: 'code2', text: 'description2' },
      ])
    })
  })

  describe('objectToSelectOptions', () => {
    it('should map objects to select options', () => {
      const data: { id: string; desc: string; random: string }[] = [
        {
          id: 'id1',
          desc: 'desc1',
          random: 'random1',
        },
        {
          id: 'id2',
          desc: 'desc2',
          random: 'random2',
        },
      ]
      const selectOptions = objectToSelectOptions(data, 'id', 'desc', 'id2')

      expect(selectOptions).toEqual([
        { value: 'id1', text: 'desc1' },
        { value: 'id2', text: 'desc2', selected: true },
      ])
    })
  })

  describe('format community manager', () => {
    it.each([
      ['Staff recorded', { name: { forename: 'JOHN', surname: 'SMITH' } } as CommunityManager, 'John Smith'],
      [
        'Staff unallocated',
        { team: { description: 'Probation Team' }, unallocated: true },
        'Probation Team (COM not yet allocated)',
      ],
      ['404', null, 'Not assigned'],
    ])('%s: formatCommunityManager(%s, %s, %s)', (_: string, communityManager: CommunityManager, expected: string) => {
      expect(formatCommunityManager(communityManager)).toEqual(expected)
    })
  })

  describe('groupBy', () => {
    const groupKey = 'groupKey'
    const group1Key = 'group1'
    const group2Key = 'group2'

    const group1Item1 = { itemId: 'group1item1', [groupKey]: group1Key }
    const group1Item2 = { itemId: 'group1item2', [groupKey]: group1Key }
    const group2Item1 = { itemId: 'group2item1', [groupKey]: group2Key }

    it('groupBy null list produces falsy response', () => {
      expect(groupBy(null, groupKey)).toBeNull()
    })

    it('groupBy empty list produces falsy response', () => {
      // should this not actually just return an empty object??
      expect(groupBy([], groupKey)).toBeFalsy()
    })

    it('groupBy list that does not contain the grouping key should return an empty list', () => {
      // unexpected behaviour....
      expect(groupBy([group1Item1], 'notthere' as keyof typeof group1Item1)).toEqual({ undefined: [group1Item1] })
    })

    it('groupBy single item', () => {
      expect(groupBy([group1Item1], groupKey)).toEqual({ [group1Key]: [group1Item1] })
    })

    it('groupBy multiple items', () => {
      expect(groupBy([group1Item1, group1Item2, group2Item1], groupKey)).toEqual({
        [group1Key]: [group1Item1, group1Item2],
        [group2Key]: [group2Item1],
      })
    })
  })

  describe('address to summary items', () => {
    it.each([
      [
        'Full normal address',
        {
          primary: true,
          mail: true,
          noFixedAddress: false,
          startDate: '2024-01-01',
          street: 'Street',
          town: 'Town',
          postalCode: 'AB1 1AB',
          phones: [{ type: 'HOME', number: '1234567890' }],
          addressUsages: [{ addressUsage: 'RECEP', addressUsageDescription: 'Reception', activeFlag: true }],
          comment: 'Comment',
        } as Address,
        [
          {
            key: { text: 'Address' },
            value: { html: 'Street<br/>Town<br/>AB1 1AB' },
            classes: 'govuk-summary-list__row--no-border',
          },
          {
            key: { text: 'Type of address' },
            value: { html: 'Reception' },
          },
          {
            key: { text: 'Phone' },
            value: { html: '1234567890' },
          },
          {
            key: { text: 'Comment' },
            value: { text: 'Comment' },
          },
        ],
      ],
      [
        'No fixed address with no phone or comment',
        {
          primary: true,
          mail: true,
          noFixedAddress: true,
          startDate: '2024-01-01',
          street: 'Street',
          town: 'Town',
          postalCode: 'AB1 1AB',
          addressUsages: [{ addressUsage: 'RECEP', addressUsageDescription: 'Reception', activeFlag: false }],
        } as Address,
        [
          {
            key: { text: 'Address' },
            value: { html: 'No fixed address' },
            classes: 'govuk-summary-list__row--no-border',
          },
          {
            key: { text: 'Type of address' },
            value: { html: 'Not entered' },
          },
        ],
      ],
      ['No address', null, []],
    ])('%s: addressToSummaryItems(%s, %s, %s)', (_: string, address: Address, expected: GovSummaryItem[]) => {
      expect(addressToSummaryItems(address)).toEqual(expected)
    })
  })

  describe('add default selected value', () => {
    const testItems: SelectOption[] = [{ value: 'val', text: 'text' }]

    it.each([
      ['null', null, 'default', undefined, null],
      [
        'Hide default',
        testItems,
        'default',
        undefined,
        [{ text: 'default', value: '', selected: true, attributes: { hidden: 'hidden' } }, ...testItems],
      ],
      ['Keep default', testItems, 'default', false, [{ text: 'default', value: '', selected: true }, ...testItems]],
    ])(
      '%s: addDefaultSelectedValue(%s, %s, %s, %s)',
      (_: string, items: SelectOption[], text: string, setHidden: boolean, expected: SelectOption[] | null) => {
        expect(addDefaultSelectedValue(items, text, setHidden)).toEqual(expected)
      },
    )
  })

  describe('formatPomName', () => {
    it.each([
      ['Valid name', 'SMITH, JOHN', 'John Smith'],
      ['Invalid name', 'BILLY JONES', 'BILLY JONES'],
      ['No POM supplied', null, null],
    ])('%s: formatPomName(%s)', (_: string, pomName: string, expected: string) => {
      expect(formatPomName(pomName)).toEqual(expected)
    })
  })

  describe('snakeToCamelCase', () => {
    it.each([
      ['FACIAL_HAIR', 'facialHair'],
      ['BUILD', 'build'],
      ['MULTI_WORD_PARAM_NAME', 'multiWordParamName'],
      ['', ''],
      [undefined, undefined],
    ])('%s: snakeToCamelCase(%s)', (str: string, expected: string) => {
      expect(snakeToCamelCase(str)).toEqual(expected)
    })
  })

  describe('camelToSnakeCase', () => {
    it.each([
      ['facialHair', 'FACIAL_HAIR'],
      ['build', 'BUILD'],
      ['multiWordParamName', 'MULTI_WORD_PARAM_NAME'],
      ['', ''],
      [undefined, undefined],
    ])('%s: camelToSnakeCase(%s)', (str: string, expected: string) => {
      expect(camelToSnakeCase(str)).toEqual(expected)
    })
  })

  describe('formatHeight', () => {
    it.each([
      [0, '0m'],
      [10, '0.1m'],
      [15, '0.15m'],
      [200, '2m'],
      [210, '2.1m'],
      [211, '2.11m'],
      [null, 'Not entered'],
    ])('%s: formatHeight(%s)', (height: number, expected: string) => {
      expect(formatHeight(height)).toEqual(expected)
    })
  })

  describe('formatWeight', () => {
    it.each([
      [0, '0kg'],
      [50, '50kg'],
      [123, '123kg'],
      [null, 'Not entered'],
    ])('%s: formatWeight(%s)', (weight: number, expected: string) => {
      expect(formatWeight(weight)).toEqual(expected)
    })
  })

  describe('sortByLatestAndUuid', () => {
    test.each([
      ['empty list', [], []],
      ['list with one item', [{ id: 'abc', latest: true }], [{ id: 'abc', latest: true }]],
      [
        'list sorted by latest and then by id',
        [
          { id: 'a', latest: false },
          { id: 'b', latest: true },
          { id: 'c', latest: false },
        ],
        [
          { id: 'b', latest: true },
          { id: 'c', latest: false },
          { id: 'a', latest: false },
        ],
      ],
    ])('should sort %s', (_, input, expected) => {
      expect(sortByLatestAndUuid(input)).toEqual(expected)
    })

    test('should not mutate the original array', () => {
      const input = [
        { id: 'b', latest: true },
        { id: 'a', latest: false },
      ]
      const copy = [...input]
      sortByLatestAndUuid(input)
      expect(input).toEqual(copy)
    })
  })
})
