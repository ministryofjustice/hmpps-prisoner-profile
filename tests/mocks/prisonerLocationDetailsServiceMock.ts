import LocationDetailsService from '../../server/services/locationDetailsService'
import Interface from './Interface'

export const prisonerLocationDetailsServiceMock = (): Interface<LocationDetailsService> => ({
  getInmatesAtLocation: jest.fn(),
  isReceptionFull: jest.fn(),
  getLocationDetailsByLatestFirst: jest.fn(),
  getLocationDetailsGroupedByPeriodAtAgency: jest.fn(),
})
