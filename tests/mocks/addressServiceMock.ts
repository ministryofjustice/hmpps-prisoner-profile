import Interface from './Interface'
import AddressService from '../../server/services/addressService'

export const addressServiceMock = (): Interface<AddressService> => ({
  getAddresses: jest.fn(),
  getAddressesMatchingQuery: jest.fn(),
  getAddressByUprn: jest.fn(),
  getCityReferenceData: jest.fn(),
  getCountyReferenceData: jest.fn(),
  getCountryReferenceData: jest.fn(),
})
