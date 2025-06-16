import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Address from '../data/interfaces/prisonApi/Address'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { OsPlacesApiClient } from '../data/interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from '../data/interfaces/osPlacesApi/osPlacesQueryResponse'
import OsPlacesDeliveryPointAddress from '../data/interfaces/osPlacesApi/osPlacesDeliveryPointAddress'
import { convertToTitleCase } from '../utils/utils'
import ReferenceDataService from './referenceData/referenceDataService'
import AddressMapper from './mappers/addressMapper'
import {
  AddressRequestDto,
  AddressResponseDto,
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import NotFoundError from '../utils/notFoundError'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import { PersonalRelationshipsReferenceDataDomain } from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default class AddressService {
  private readonly addressMapper: AddressMapper

  constructor(
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

  public async createAddress(
    token: string,
    prisonerNumber: string,
    address: AddressRequestDto,
  ): Promise<AddressResponseDto> {
    return this.personIntegrationApiClientBuilder(token).createAddress(prisonerNumber, address)
  }

  public async getAddressesFromPrisonAPI(token: string, prisonerNumber: string): Promise<Address[]> {
    return this.prisonApiClientBuilder(token).getAddresses(prisonerNumber)
  }

  public async getAddressesMatchingQuery(searchQuery: string): Promise<OsAddress[]> {
    const response = await this.osPlacesApiClient.getAddressesByFreeTextQuery(searchQuery)
    return this.handleResponse(response)
  }

  public async getAddressByUprn(uprn: string, token: string): Promise<AddressRequestDto> {
    const response = await this.osPlacesApiClient.getAddressesByUprn(uprn)
    const result = this.handleResponse(response)

    if (result.length !== 1) {
      throw new NotFoundError('Could not find unique address by UPRN')
    }

    return this.addressMapper.toAddressRequestDto(result[0], token)
  }

  public async getCityReferenceData(code: string, token: string): Promise<ReferenceDataCodeDto> {
    return (
      code && this.referenceDataService.getReferenceData(PersonalRelationshipsReferenceDataDomain.City, code, token)
    )
  }

  public async getCountyReferenceData(code: string, token: string): Promise<ReferenceDataCodeDto> {
    return code && this.referenceDataService.getReferenceData(CorePersonRecordReferenceDataDomain.county, code, token)
  }

  public async getCountryReferenceData(code: string, token: string): Promise<ReferenceDataCodeDto> {
    return code && this.referenceDataService.getReferenceData(CorePersonRecordReferenceDataDomain.country, code, token)
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
