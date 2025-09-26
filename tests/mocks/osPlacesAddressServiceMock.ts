import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'

export const osPlacesAddressServiceMock = (): OsPlacesAddressService =>
  ({
    getAddressesMatchingQuery: jest.fn(),
    getAddressByUprn: jest.fn(),
    sanitiseUkPostcode: jest.fn(),
  }) as unknown as OsPlacesAddressService

export default { osPlacesAddressServiceMock }
