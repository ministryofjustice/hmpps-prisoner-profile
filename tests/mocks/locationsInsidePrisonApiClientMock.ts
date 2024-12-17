import { LocationsInsidePrisonApiClient } from '../../server/data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'

export const locationsInsidePrisonApiClientMock = (): LocationsInsidePrisonApiClient => ({
  getLocation: jest.fn(),
})
