import Interface from './Interface'
import AddressService from '../../server/services/addressService'

export const addressServiceMock = (): Interface<AddressService> => ({
  createAddress: jest.fn(),
  getAddresses: jest.fn(),
  getAddressesForDisplay: jest.fn(),
  getAddressesFromPrisonAPI: jest.fn(),
  getAddressesMatchingQuery: jest.fn(),
  getAddressByUprn: jest.fn(),
  getCityCode: jest.fn(),
  getCityReferenceData: jest.fn(),
  getCountyCode: jest.fn(),
  getCountyReferenceData: jest.fn(),
  getCountryCode: jest.fn(),
  getCountryReferenceData: jest.fn(),
  sanitisePostcode: jest.fn(),
})
