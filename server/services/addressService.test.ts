import { subDays } from 'date-fns'
import { OsAddress, OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import AddressService from './addressService'
import { osPlacesAddressServiceMock } from '../../tests/mocks/osPlacesAddressServiceMock'
import { mockAddresses } from '../data/localMockData/addresses'
import {
  AddressResponseDto,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'
import { mockAddressRequestDto, mockAddressResponseDto } from '../data/localMockData/personIntegrationApi/addresses'
import ReferenceDataService from './referenceData/referenceDataService'
import MetricsService from './metrics/metricsService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import { AddressLocation } from './mappers/addressMapper'
import { formatDateISO } from '../utils/dateHelpers'
import { AddressForDisplay } from './interfaces/personalPageService/PersonalPage'
import NotFoundError from '../utils/notFoundError'
import { mockOsAddresses } from '../data/localMockData/osAddressesMock'

const clientToken = 'CLIENT_TOKEN'

describe('addressService', () => {
  let metricsService: MetricsService
  let referenceDataService: ReferenceDataService
  let osPlacesAddressService: OsPlacesAddressService
  let prisonApiClient: PrisonApiClient
  let personIntegrationApiClient: PersonIntegrationApiClient
  let addressService: AddressService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    personIntegrationApiClient = personIntegrationApiClientMock()
    osPlacesAddressService = osPlacesAddressServiceMock()

    metricsService = new MetricsService() as jest.Mocked<MetricsService>
    referenceDataService = new ReferenceDataService(null, null) as jest.Mocked<ReferenceDataService>
    referenceDataService.getReferenceData = jest.fn()
    referenceDataService.getActiveReferenceDataCodes = jest.fn()

    addressService = new AddressService(
      metricsService,
      referenceDataService,
      osPlacesAddressService,
      () => prisonApiClient,
      () => personIntegrationApiClient,
    )
  })

  describe('createAddress', () => {
    it('submits request to create address to person integration API', async () => {
      personIntegrationApiClient.createAddress = jest.fn().mockResolvedValue(mockAddressResponseDto)
      metricsService.trackPersonIntegrationUpdate = jest.fn()

      const response = await addressService.createAddress(
        clientToken,
        PrisonerMockDataA.prisonerNumber,
        mockAddressRequestDto,
        prisonUserMock,
      )

      expect(response).toEqual(mockAddressResponseDto)
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['address'],
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        user: prisonUserMock,
      })
    })
  })

  describe('getAddressesFromPrisonAPI', () => {
    it('Handles address data from prison API correctly', async () => {
      prisonApiClient.getAddresses = jest.fn(async () => mockAddresses)
      const addresses = await addressService.getAddressesFromPrisonAPI('token', 'A1234AA')
      expect(addresses).toEqual(mockAddresses)
    })
  })

  describe('getAddresses', () => {
    it('Handles address data from person integration API correctly', async () => {
      personIntegrationApiClient.getAddresses = jest.fn(async () => [mockAddressResponseDto])
      const addresses = await addressService.getAddresses('token', 'A1234AA')
      expect(addresses).toEqual([mockAddressResponseDto])
    })
  })

  describe('getAddressesForDisplay', () => {
    it('Handles the API returning 404 for addresses', async () => {
      personIntegrationApiClient.getAddresses = jest.fn(async (): Promise<AddressResponseDto[]> => null)

      const addresses = await addressService.getAddressesForDisplay('token', 'A1234AA')
      expect(addresses).toEqual([])
    })

    it('Filters out expired addresses', async () => {
      personIntegrationApiClient.getAddresses = jest.fn(async () => [
        { ...mockAddressResponseDto, toDate: formatDateISO(subDays(new Date(), 1)) },
      ])

      const addresses = await addressService.getAddressesForDisplay('token', 'A1234AA')
      expect(addresses).toEqual([])
    })

    it.each([
      [
        'Adds phone type reference data to the result',
        mockAddressResponseDto,
        {
          addressPhoneNumbersForDisplay: [
            {
              id: 123,
              type: 'HOME',
              typeDescription: 'Home',
              number: '012345678',
              extension: '567',
            },
          ],
        },
      ],
      [
        'Handles null toDate when filtering',
        { addressPhoneNumbers: [], toDate: null },
        { addressPhoneNumbers: [], addressPhoneNumbersForDisplay: [], toDate: null },
      ],
      [
        'Handles building number returned as building name',
        { buildingNumber: null, buildingName: '1' },
        { buildingName: undefined, buildingNumber: '1' },
      ],
      [
        'Handles building number as part of building name',
        { buildingNumber: null, buildingName: 'The Place, 1' },
        { buildingName: 'The Place', buildingNumber: '1' },
      ],
      [
        'Handles subBuildingName if present',
        { buildingNumber: '1', subBuildingName: 'Flat 2', buildingName: 'The Place' },
        { subBuildingName: 'Flat 2', buildingName: 'The Place', buildingNumber: '1' },
      ],
      [
        'Splits comma separated buildingName and populates subBuildingName',
        { buildingNumber: null, subBuildingName: null, buildingName: 'The Flat, The Place, 1' },
        { subBuildingName: 'The Flat', buildingName: 'The Place', buildingNumber: '1' },
      ],
      [
        'Handles multiple commas separating buildingName',
        { buildingNumber: null, subBuildingName: null, buildingName: 'Thing 1, Thing 2, Thing 3, The Place, 1' },
        { subBuildingName: 'Thing 1', buildingName: 'Thing 2, Thing 3, The Place', buildingNumber: '1' },
      ],
      [
        'Handles building number and building name',
        { buildingNumber: '1', buildingName: 'The Place' },
        { buildingNumber: '1', buildingName: 'The Place' },
      ],
    ])(
      '%s',
      async (
        _: string,
        addressOverride: Partial<AddressResponseDto>,
        addressForDisplay: Partial<AddressForDisplay>,
      ) => {
        personIntegrationApiClient.getAddresses = jest.fn(async () => [
          { ...mockAddressResponseDto, ...addressOverride } as AddressResponseDto,
        ])

        referenceDataService.getActiveReferenceDataCodes = jest
          .fn()
          .mockResolvedValue([{ code: 'HOME', description: 'Home' }])

        const addresses = await addressService.getAddressesForDisplay('token', 'A1234AA')
        expect(addresses).toEqual([expect.objectContaining(addressForDisplay)])
      },
    )
  })

  describe('getCityCode', () => {
    it('Returns city data from the reference data service', async () => {
      referenceDataService.getReferenceData = jest.fn().mockResolvedValue({ code: 'CITY1' } as ReferenceDataCodeDto)
      expect(await addressService.getCityCode('CITY1', clientToken)).toEqual({ code: 'CITY1' })
    })

    it.each([undefined, null])('Handles falsy code: %s', async code => {
      expect(await addressService.getCityCode(code, clientToken)).toBeFalsy()
      expect(referenceDataService.getReferenceData).not.toHaveBeenCalled()
    })
  })

  describe('getCountyCode', () => {
    it('Returns county data from the reference data service', async () => {
      referenceDataService.getReferenceData = jest.fn().mockResolvedValue({ code: 'COUNTY1' } as ReferenceDataCodeDto)
      expect(await addressService.getCountyCode('COUNTY1', clientToken)).toEqual({ code: 'COUNTY1' })
    })

    it.each([undefined, null])('Handles falsy code: %s', async code => {
      expect(await addressService.getCountyCode(code, clientToken)).toBeFalsy()
      expect(referenceDataService.getReferenceData).not.toHaveBeenCalled()
    })
  })

  describe('getCountryCode', () => {
    it('Returns country data from the reference data service', async () => {
      referenceDataService.getReferenceData = jest.fn().mockResolvedValue({ code: 'COUNTRY1' } as ReferenceDataCodeDto)
      expect(await addressService.getCountryCode('COUNTRY1', clientToken)).toEqual({ code: 'COUNTRY1' })
    })

    it.each([undefined, null])('Handles falsy code: %s', async code => {
      expect(await addressService.getCountryCode(code, clientToken)).toBeFalsy()
      expect(referenceDataService.getReferenceData).not.toHaveBeenCalled()
    })
  })

  describe('getCityReferenceData', () => {
    it('Returns city reference data from the reference data service', async () => {
      referenceDataService.getActiveReferenceDataCodes = jest
        .fn()
        .mockResolvedValue([{ code: 'CITY1' } as ReferenceDataCodeDto])

      expect(await addressService.getCityReferenceData(clientToken)).toEqual([{ code: 'CITY1' }])
    })
  })

  describe('getCountyReferenceData', () => {
    it('Returns county reference data from the reference data service', async () => {
      referenceDataService.getActiveReferenceDataCodes = jest
        .fn()
        .mockResolvedValue([{ code: 'COUNTY1' } as ReferenceDataCodeDto])

      expect(await addressService.getCountyReferenceData(clientToken)).toEqual([{ code: 'COUNTY1' }])
    })
  })

  describe('getCountryReferenceData', () => {
    it('Returns overseas country reference data from the reference data service', async () => {
      referenceDataService.getActiveReferenceDataCodes = jest
        .fn()
        .mockResolvedValue([{ code: 'COUNTRY1' }, { code: 'ENG' }])

      expect(
        await addressService.getCountryReferenceData(clientToken, { addressLocation: AddressLocation.overseas }),
      ).toEqual([{ code: 'COUNTRY1' }])
    })

    it.each([AddressLocation.uk, AddressLocation.no_fixed_address])(
      'Returns UK country reference data from the reference data service for location: %s',
      async addressLocation => {
        referenceDataService.getActiveReferenceDataCodes = jest
          .fn()
          .mockResolvedValue([{ code: 'COUNTRY1' }, { code: 'ENG' }])

        expect(await addressService.getCountryReferenceData(clientToken, { addressLocation })).toEqual([
          { code: 'ENG' },
        ])
      },
    )
  })

  describe('sanitisePostcode - UK', () => {
    it('delegates to OsPlacesAddressService', () => {
      addressService.sanitisePostcode('SW1H 9AJ', AddressLocation.uk)
      expect(osPlacesAddressService.sanitiseUkPostcode).toHaveBeenCalledWith('SW1H 9AJ')
    })
  })

  describe('sanitisePostcode - Overseas', () => {
    it.each([
      [undefined, undefined],
      [null, null],
      ['', ''],
      ['abc', 'ABC'],
    ])(`before: '%s', after: '%s'`, (before, after) => {
      expect(addressService.sanitisePostcode(before, AddressLocation.overseas)).toEqual(after)
    })
  })

  describe('getAddressesMatchingQuery', () => {
    const searchQuery = 'test,query'

    it('Delegates to the osPlacesAddressService', async () => {
      osPlacesAddressService.getAddressesMatchingQuery = jest.fn(async () => mockOsAddresses)
      const addresses = await addressService.getAddressesMatchingQuery(searchQuery)
      expect(addresses).toEqual(mockOsAddresses)
    })
  })

  describe('getAddressesByUprn', () => {
    it('Throws NotFoundException if empty result returned', async () => {
      osPlacesAddressService.getAddressByUprn = jest.fn(async () => null as OsAddress)
      await expect(addressService.getAddressByUprn('123', clientToken)).rejects.toThrow(
        new NotFoundError('Could not find address by UPRN'),
      )
    })

    it('Maps the returned address correctly', async () => {
      osPlacesAddressService.getAddressByUprn = jest.fn(async () => mockOsAddresses[1])
      referenceDataService.getActiveReferenceDataCodes = jest
        .fn()
        .mockResolvedValue([{ description: 'My Post Town', code: 'CITY1' } as ReferenceDataCodeDto])

      const address = await addressService.getAddressByUprn('12345', clientToken)

      expect(address).toEqual(
        expect.objectContaining({
          uprn: 12346,
          buildingNumber: '1',
          subBuildingName: '',
          buildingName: '',
          thoroughfareName: 'The Road',
          dependantLocality: 'My Town',
          postTownCode: 'CITY1',
          countryCode: 'ENG',
          postCode: 'A123BC',
          addressTypes: [],
        }),
      )
    })
  })
})
