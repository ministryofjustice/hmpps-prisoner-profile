import { OsPlacesApiClient } from '../../server/data/interfaces/osPlacesApi/osPlacesApiClient'

export const osPlacesApiClientMock = (): OsPlacesApiClient => ({
  getAddressesByPostcode: jest.fn(),
  getAddressesByFreeTextQuery: jest.fn(),
})
