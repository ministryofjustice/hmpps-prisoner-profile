import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Address from '../data/interfaces/prisonApi/Address'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { OsPlacesApiClient } from '../data/interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from '../data/interfaces/osPlacesApi/osPlacesQueryResponse'
import OsPlacesDeliveryPointAddress from '../data/interfaces/osPlacesApi/osPlacesDeliveryPointAddress'
import { convertToTitleCase } from '../utils/utils'
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
import logger from '../../logger'

const stringContainingPostCodeRegex = /^(.*?)([A-Z]{1,2}\d[A-Z\d]? ?)(\d[A-Z]{2})(.*)$/i
const numericStringRegex = /^[0-9]+$/i
const buildingNumberAtEndOfStringRegex = /^(.*?),? ([0-9]+)$/i

export default class AddressService {
  private readonly addressMapper: AddressMapper

  constructor(
    private readonly metricsService: MetricsService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly osPlacesApiClient: OsPlacesApiClient,
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

  public async getAddressesFromPrisonAPI(token: string, prisonerNumber: string): Promise<Address[]> {
    return this.prisonApiClientBuilder(token).getAddresses(prisonerNumber)
  }

  public async getAddressesMatchingQuery(searchQuery: string, sanitisePostcode: boolean = true): Promise<OsAddress[]> {
    const response = await this.osPlacesApiClient.getAddressesByFreeTextQuery(
      sanitisePostcode ? this.sanitisePostcode(searchQuery, AddressLocation.uk) : searchQuery,
    )
    return this.handleResponse(response)
  }

  public async getAddressByUprn(uprn: string, token: string): Promise<AddressRequestDto> {
    const response = await this.osPlacesApiClient.getAddressesByUprn(uprn)
    const result = this.handleResponse(response)

    if (result.length === 0) throw new NotFoundError('Could not find address by UPRN')
    if (result.length > 1) logger.info(`Multiple results returned for UPRN`)

    return this.addressMapper.toAddressRequestDto(result[result.length - 1], token)
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
      const postCodeQuery = stringContainingPostCodeRegex.exec(stringContainingPostcode?.replace(/[^A-Z0-9 ]/gi, ''))
      if (!postCodeQuery) return stringContainingPostcode

      return `${postCodeQuery[1]}${postCodeQuery[2].toUpperCase().trim()} ${postCodeQuery[3].toUpperCase().trim()}${postCodeQuery[4]}`
    }
    return stringContainingPostcode?.trim()?.toUpperCase() ?? stringContainingPostcode
  }

  private handleResponse(response: OsPlacesQueryResponse): OsAddress[] {
    if (response.header && response.header.totalresults === 0) return []

    return response.results.map(result => this.toOsAddress(result.DPA))
  }

  private toOsAddress(addressResult: OsPlacesDeliveryPointAddress): OsAddress {
    const {
      UPRN,
      DEPENDENT_LOCALITY,
      SUB_BUILDING_NAME,
      BUILDING_NAME,
      BUILDING_NUMBER,
      THOROUGHFARE_NAME,
      POST_TOWN,
      POSTCODE,
      COUNTRY_CODE,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION,
    } = addressResult

    return {
      addressString: this.formatAddressString(addressResult),
      buildingNumber: BUILDING_NUMBER,
      buildingName: convertToTitleCase(BUILDING_NAME),
      subBuildingName: convertToTitleCase(SUB_BUILDING_NAME),
      thoroughfareName: convertToTitleCase(THOROUGHFARE_NAME),
      dependentLocality: convertToTitleCase(DEPENDENT_LOCALITY),
      postTown: convertToTitleCase(POST_TOWN),
      county: convertToTitleCase(LOCAL_CUSTODIAN_CODE_DESCRIPTION),
      postcode: POSTCODE,
      country: COUNTRY_CODE,
      uprn: UPRN,
    }
  }

  private formatAddressString(addressResult: OsPlacesDeliveryPointAddress) {
    const { ADDRESS, BUILDING_NUMBER, THOROUGHFARE_NAME, POSTCODE } = addressResult
    const withoutPostcode = ADDRESS.replace(`, ${POSTCODE}`, '').replace(
      `${BUILDING_NUMBER}, ${THOROUGHFARE_NAME}`,
      `${BUILDING_NUMBER} ${THOROUGHFARE_NAME}`,
    )
    return `${convertToTitleCase(withoutPostcode)}, ${POSTCODE}`
  }
}
