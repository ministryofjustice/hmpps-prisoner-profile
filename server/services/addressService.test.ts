import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { OsPlacesApiClient } from '../data/interfaces/osPlacesApi/osPlacesApiClient'
import AddressService from './addressService'
import { osPlacesApiClientMock } from '../../tests/mocks/osPlacesApiClientMock'
import {
  mockOsPlacesAddressQueryEmptyResponse,
  mockOsPlacesAddressQueryResponse,
} from '../data/localMockData/osPlacesAddressQueryResponse'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { mockAddresses } from '../data/localMockData/addresses'

describe('addressService', () => {
  let prisonApiClient: PrisonApiClient
  let osPlacesApiClient: OsPlacesApiClient
  let addressService: AddressService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    osPlacesApiClient = osPlacesApiClientMock()
    addressService = new AddressService(() => prisonApiClient, osPlacesApiClient)
  })

  describe('getAddresses', () => {
    it('Handles address data from prison API correctly', async () => {
      prisonApiClient.getAddresses = jest.fn(async () => mockAddresses)
      const addresses = await addressService.getAddresses('token', 'A1234AA')
      expect(addresses).toEqual(mockAddresses)
    })
  })

  describe('getAddressesMatchingQuery', () => {
    const searchQuery = 'test,query'

    it('Handles empty address response', async () => {
      osPlacesApiClient.getAddressesByFreeTextQuery = jest.fn(async () => mockOsPlacesAddressQueryEmptyResponse)
      const addresses = await addressService.getAddressesMatchingQuery(searchQuery)
      expect(addresses.length).toEqual(0)
    })

    it('Maps the returned addresses correctly', async () => {
      osPlacesApiClient.getAddressesByFreeTextQuery = jest.fn(async () => mockOsPlacesAddressQueryResponse)
      const addresses = await addressService.getAddressesMatchingQuery(searchQuery)
      validateExpectedAddressResponse(addresses)
    })
  })

  function validateExpectedAddressResponse(addresses: OsAddress[]) {
    expect(addresses.length).toEqual(2)
    expect(addresses[0].addressString).toEqual('1 The Road, My Town, A123BC')
    expect(addresses[0].buildingNumber).toEqual(1)
    expect(addresses[0].subBuildingName).toEqual('')
    expect(addresses[0].thoroughfareName).toEqual('The Road')
    expect(addresses[0].dependentLocality).toEqual('My Town')
    expect(addresses[0].postTown).toEqual('My Post Town')
    expect(addresses[0].county).toEqual('My County')
    expect(addresses[0].postcode).toEqual('A123BC')
    expect(addresses[0].country).toEqual('E')
    expect(addresses[0].uprn).toEqual(12345)

    expect(addresses[1].addressString).toEqual('2 The Road, My Town, A123BC')
    expect(addresses[1].buildingNumber).toEqual(2)
    expect(addresses[1].subBuildingName).toEqual('')
    expect(addresses[1].thoroughfareName).toEqual('The Road')
    expect(addresses[1].dependentLocality).toEqual('My Town')
    expect(addresses[1].postTown).toEqual('My Post Town')
    expect(addresses[1].county).toEqual('My County')
    expect(addresses[1].postcode).toEqual('A123BC')
    expect(addresses[1].country).toEqual('E')
    expect(addresses[1].uprn).toEqual(12346)
  }
})
