import Interface from './Interface'
import AddressService from '../../server/services/addressService'

export const addressServiceMock = (): Interface<AddressService> => ({
  getAddresses: jest.fn(),
  getAddressesMatchingQuery: jest.fn(),
  getAddressesByUprn: jest.fn(),
})
