import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Address from '../data/interfaces/prisonApi/Address'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { OsPlacesApiClient } from '../data/interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from '../data/interfaces/osPlacesApi/osPlacesQueryResponse'
import OsPlacesDeliveryPointAddress from '../data/interfaces/osPlacesApi/osPlacesDeliveryPointAddress'

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

  async handleResponse(response: OsPlacesQueryResponse): Promise<OsAddress[]> {
    if (response.header && response.header.totalresults === 0) {
      return []
    }

    return response.results.map(result => this.toOsAddress(result.DPA))
  }

  toOsAddress(addressResult: OsPlacesDeliveryPointAddress): OsAddress {
    const {
      UPRN,
      ADDRESS,
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
      addressString: ADDRESS,
      buildingNumber: BUILDING_NUMBER,
      buildingName: BUILDING_NAME,
      subBuildingName: SUB_BUILDING_NAME,
      thoroughfareName: THOROUGHFARE_NAME,
      dependentLocality: DEPENDENT_LOCALITY,
      postTown: POST_TOWN,
      county: LOCAL_CUSTODIAN_CODE_DESCRIPTION,
      postcode: POSTCODE,
      country: COUNTRY_CODE,
      uprn: UPRN,
    }
  }
}
