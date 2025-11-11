import { OsAddress, OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Address from '../data/interfaces/prisonApi/Address'
import ReferenceDataService from './referenceData/referenceDataService'
import AddressMapper, { AddressLocation } from './mappers/addressMapper'
import {
  AddressRequestDto,
  AddressResponseDto,
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import NotFoundError from '../utils/notFoundError'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import { PersonalRelationshipsReferenceDataDomain } from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import MetricsService from './metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'
import { AddressForDisplay } from './interfaces/personalPageService/PersonalPage'
import { transformPhones } from '../utils/transformPhones'

const numericStringRegex = /^[0-9]+$/i
const buildingNumberAtEndOfStringRegex = /^(.*?),? ([0-9]+)$/i

export default class AddressService {
  private readonly addressMapper: AddressMapper

  constructor(
    private readonly metricsService: MetricsService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly osPlacesAddressService: OsPlacesAddressService,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
  ) {
    this.addressMapper = new AddressMapper(referenceDataService)
  }

  public async getAddresses(token: string, prisonerNumber: string): Promise<AddressResponseDto[]> {
    return this.personIntegrationApiClientBuilder(token).getAddresses(prisonerNumber)
  }

  async transformAddresses(token: string, addresses: AddressResponseDto[]): Promise<AddressForDisplay[]> {
    const phoneTypes = await this.referenceDataService.getActiveReferenceDataCodes(
      CorePersonRecordReferenceDataDomain.phoneTypes,
      token,
    )
    return (
      addresses
        ?.map(address => {
          const buildingNumber = this.getBuildingNumberForDisplay(address.buildingNumber, address.buildingName)?.trim()
          const buildingName = this.getBuildingNameForDisplay(address.buildingNumber, address.buildingName)?.trim()
          const buildingParts = !address.subBuildingName && buildingName?.split(',')
          return {
            ...address,
            buildingNumber,
            subBuildingName: address.subBuildingName || (buildingParts?.length > 1 ? buildingParts[0]?.trim() : null),
            buildingName: buildingParts?.length > 1 ? buildingParts.slice(1)?.join(',')?.trim() : buildingName,
            addressTypes: address.addressTypes.filter(type => type.active),
            addressPhoneNumbersForDisplay: transformPhones(address.addressPhoneNumbers, phoneTypes),
          } as AddressForDisplay
        })
        ?.filter(address => !address.toDate || new Date(address.toDate) > new Date())
        .sort(a => (a.primaryAddress ? -1 : 1)) || []
    )
  }

  async getAddressesForDisplay(token: string, prisonerNumber: string): Promise<AddressForDisplay[]> {
    const addresses = await this.getAddresses(token, prisonerNumber)
    return this.transformAddresses(token, addresses)
  }

  private getBuildingNumberForDisplay(buildingNumber: string, buildingName: string) {
    const buildingNameIsTheBuildingNumber = !buildingNumber && numericStringRegex.test(buildingName?.trim())
    const buildingNameContainsTheBuildingNumber =
      !buildingNumber && buildingNumberAtEndOfStringRegex.exec(buildingName?.trim())

    if (buildingNameIsTheBuildingNumber) {
      return buildingName
    }

    if (buildingNameContainsTheBuildingNumber) {
      return buildingNameContainsTheBuildingNumber[2]
    }

    return buildingNumber
  }

  private getBuildingNameForDisplay(buildingNumber: string, buildingName: string) {
    const buildingNameIsTheBuildingNumber = !buildingNumber && numericStringRegex.test(buildingName?.trim())
    const buildingNameContainsTheBuildingNumber =
      !buildingNumber && buildingNumberAtEndOfStringRegex.exec(buildingName?.trim())

    if (buildingNameIsTheBuildingNumber) {
      return null
    }

    if (buildingNameContainsTheBuildingNumber) {
      return buildingNameContainsTheBuildingNumber[1]
    }

    return buildingName
  }

  public async createAddress(
    token: string,
    prisonerNumber: string,
    address: AddressRequestDto,
    user: PrisonUser,
  ): Promise<AddressResponseDto> {
    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['address'],
      prisonerNumber,
      user,
    })

    return this.personIntegrationApiClientBuilder(token).createAddress(prisonerNumber, address)
  }

  public async getAddressesFromPrisonAPI(token: string, prisonerNumber: string): Promise<Address[] | null> {
    return this.prisonApiClientBuilder(token).getAddresses(prisonerNumber)
  }

  public async getAddressesMatchingQuery(searchQuery: string, sanitisePostcode: boolean = true): Promise<OsAddress[]> {
    return this.osPlacesAddressService.getAddressesMatchingQuery(searchQuery, sanitisePostcode)
  }

  public async getAddressByUprn(uprn: string, token: string): Promise<AddressRequestDto> {
    const result = await this.osPlacesAddressService.getAddressByUprn(uprn)

    if (!result) throw new NotFoundError('Could not find address by UPRN')

    return this.addressMapper.toAddressRequestDto(result, token)
  }

  public async getCityCode(code: string, token: string): Promise<ReferenceDataCodeDto> {
    return (
      code && this.referenceDataService.getReferenceData(PersonalRelationshipsReferenceDataDomain.City, code, token)
    )
  }

  public async getCityReferenceData(token: string): Promise<ReferenceDataCodeDto[]> {
    return this.referenceDataService.getActiveReferenceDataCodes(PersonalRelationshipsReferenceDataDomain.City, token)
  }

  public async getCountyCode(code: string, token: string): Promise<ReferenceDataCodeDto> {
    return code && this.referenceDataService.getReferenceData(CorePersonRecordReferenceDataDomain.county, code, token)
  }

  public async getCountyReferenceData(token: string): Promise<ReferenceDataCodeDto[]> {
    return this.referenceDataService.getActiveReferenceDataCodes(CorePersonRecordReferenceDataDomain.county, token)
  }

  public async getCountryCode(code: string, token: string): Promise<ReferenceDataCodeDto> {
    return code && this.referenceDataService.getReferenceData(CorePersonRecordReferenceDataDomain.country, code, token)
  }

  public async getCountryReferenceData(
    token: string,
    options: { addressLocation: AddressLocation },
  ): Promise<ReferenceDataCodeDto[]> {
    const countryCodes = await this.referenceDataService.getActiveReferenceDataCodes(
      CorePersonRecordReferenceDataDomain.country,
      token,
    )

    return this.addressMapper.filterCountryCodes(countryCodes, options.addressLocation)
  }

  public sanitisePostcode(stringContainingPostcode: string, addressLocation: AddressLocation) {
    if (addressLocation !== AddressLocation.overseas) {
      return this.osPlacesAddressService.sanitiseUkPostcode(stringContainingPostcode)
    }
    return stringContainingPostcode?.trim()?.toUpperCase() ?? stringContainingPostcode
  }
}
