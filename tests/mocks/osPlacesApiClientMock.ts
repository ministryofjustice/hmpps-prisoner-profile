import { OsPlacesApiClient } from '../../server/data/interfaces/osPlacesApi/osPlacesApiClient'

export const osPlacesApiClientMock = (): OsPlacesApiClient => ({
  getAddressesByFreeTextQuery: jest.fn(),
})
