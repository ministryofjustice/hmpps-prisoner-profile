import LocationDetailsService from '../../server/services/locationDetailsService'

type Interface<T> = {
  [P in keyof T]: T[P]
}

export const prisonerLocationDetailsServiceMock = (): Interface<LocationDetailsService> => ({
  getInmatesAtLocation: jest.fn(),
  isReceptionFull: jest.fn(),
  getLocationDetailsByLatestFirst: jest.fn(),
  getLocationDetailsGroupedByPeriodAtAgency: jest.fn(),
})
