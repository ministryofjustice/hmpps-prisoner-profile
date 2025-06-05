import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Address from '../data/interfaces/prisonApi/Address'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { OsPlacesApiClient } from '../data/interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from '../data/interfaces/osPlacesApi/osPlacesQueryResponse'
import OsPlacesDeliveryPointAddress from '../data/interfaces/osPlacesApi/osPlacesDeliveryPointAddress'
import { convertToTitleCase } from '../utils/utils'

export default class AddressService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly osPlacesApiClient: OsPlacesApiClient,
  ) {}

  /**
   * Handle request for addresses
   *
   * @param token
   * @param prisonerNumber
   */
  public async getAddresses(token: string, prisonerNumber: string): Promise<Address[]> {
    return this.prisonApiClientBuilder(token).getAddresses(prisonerNumber)
  }

  public async getAddressesMatchingQuery(searchQuery: string): Promise<OsAddress[]> {
    const response = await this.osPlacesApiClient.getAddressesByFreeTextQuery(searchQuery)
    return this.handleResponse(response)
  }

  public async getAddressesByUprn(uprn: string): Promise<OsAddress[]> {
    const response = await this.osPlacesApiClient.getAddressesByUprn(uprn)
    return this.handleResponse(response)
  }

  private async handleResponse(response: OsPlacesQueryResponse): Promise<OsAddress[]> {
    if (response.header && response.header.totalresults === 0) {
      return []
    }

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
