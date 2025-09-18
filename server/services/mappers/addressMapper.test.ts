import { OsAddress } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import AddressMapper, { AddressLocation } from './addressMapper'
import ReferenceDataService from '../referenceData/referenceDataService'
import { ReferenceDataCodeDto } from '../../data/interfaces/referenceData'

const clientToken = 'CLIENT_TOKEN'

describe('addressService', () => {
  let referenceDataService: ReferenceDataService
  let addressMapper: AddressMapper

  beforeEach(() => {
    referenceDataService = new ReferenceDataService(null, null) as jest.Mocked<ReferenceDataService>
    referenceDataService.getActiveReferenceDataCodes = jest.fn()

    addressMapper = new AddressMapper(referenceDataService)
  })

  describe('toAddressRequestDto', () => {
    it('uses city reference data description to match to a reference data code', async () => {
      referenceDataService.getActiveReferenceDataCodes = jest
        .fn()
        .mockResolvedValue([{ code: 'TOWN1', description: 'Post Town' }])

      const result = await addressMapper.toAddressRequestDto(
        {
          addressString: 'some string',
          buildingNumber: 123,
          buildingName: 'Building Name',
          subBuildingName: 'Sub Building Name',
          thoroughfareName: 'Thoroughfare Name',
          dependentLocality: 'Dependent Locality',
          postTown: 'Post Town',
          postcode: 'A1 2BC',
          country: 'E',
          uprn: 321,
        } as OsAddress,
        clientToken,
      )

      expect(result).toEqual(
        expect.objectContaining({
          uprn: 321,
          buildingNumber: '123',
          subBuildingName: 'Sub Building Name',
          buildingName: 'Building Name',
          thoroughfareName: 'Thoroughfare Name',
          dependantLocality: 'Dependent Locality',
          postTownCode: 'TOWN1',
          countryCode: 'ENG',
          postCode: 'A1 2BC',
        }),
      )
    })

    it('uses city mapping data to match to a reference data code', async () => {
      const result = await addressMapper.toAddressRequestDto(
        {
          addressString: 'some string',
          buildingNumber: 123,
          buildingName: 'Building Name',
          subBuildingName: 'Sub Building Name',
          thoroughfareName: 'Thoroughfare Name',
          dependentLocality: 'Dependent Locality',
          postTown: 'Y Felinheli',
          postcode: 'A1 2BC',
          country: 'W',
          uprn: 321,
        } as OsAddress,
        clientToken,
      )

      expect(result).toEqual(
        expect.objectContaining({
          uprn: 321,
          buildingNumber: '123',
          subBuildingName: 'Sub Building Name',
          buildingName: 'Building Name',
          thoroughfareName: 'Thoroughfare Name',
          dependantLocality: 'Dependent Locality',
          postTownCode: '12134',
          countryCode: 'WALES',
          postCode: 'A1 2BC',
        }),
      )
    })

    it('handles undefined buildingNumber', async () => {
      const result = await addressMapper.toAddressRequestDto(
        {
          addressString: 'some string',
          buildingNumber: undefined,
          buildingName: 'Building Name',
          subBuildingName: 'Sub Building Name',
          thoroughfareName: 'Thoroughfare Name',
          dependentLocality: 'Dependent Locality',
          postTown: 'Y Felinheli',
          postcode: 'A1 2BC',
          country: 'W',
          uprn: 321,
        } as OsAddress,
        clientToken,
      )

      expect(result).toEqual(expect.objectContaining({ buildingNumber: null }))
    })
  })

  describe('filterCountryCodes', () => {
    it('Returns overseas country reference data', async () => {
      expect(
        addressMapper.filterCountryCodes(
          [{ code: 'COUNTRY1' }, { code: 'ENG' }] as ReferenceDataCodeDto[],
          AddressLocation.overseas,
        ),
      ).toEqual([{ code: 'COUNTRY1' }])
    })

    it.each([AddressLocation.uk, AddressLocation.no_fixed_address])(
      'Returns UK country reference data for location: %s',
      async addressLocation => {
        expect(
          addressMapper.filterCountryCodes(
            [{ code: 'COUNTRY1' }, { code: 'ENG' }] as ReferenceDataCodeDto[],
            addressLocation,
          ),
        ).toEqual([{ code: 'ENG' }])
      },
    )
  })
})
