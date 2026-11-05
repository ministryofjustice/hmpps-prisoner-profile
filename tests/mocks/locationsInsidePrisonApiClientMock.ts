import { LocationsInsidePrisonApiClient } from '../../server/data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'

export const locationsInsidePrisonApiClientMock = (): jest.Mocked<LocationsInsidePrisonApiClient> => ({
  getLocation: jest.fn(),
  getLocationByKey: jest.fn(),
  getLocationsForAppointments: jest.fn(),
  getLocationAttributes: jest.fn(),
})

export default { locationsInsidePrisonApiClientMock }
