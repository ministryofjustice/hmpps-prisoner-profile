import LocationDetailsService from '../../server/services/locationDetailsService'
import Interface from './Interface'

export const locationDetailsServiceMock = (): Interface<LocationDetailsService> => ({
  getInmatesAtLocation: jest.fn(),
  isReceptionFull: jest.fn(),
  getLocationDetailsByLatestFirst: jest.fn(),
  getLocationDetailsGroupedByPeriodAtAgency: jest.fn(),
  getLocationMappingUsingNomisLocationId: jest.fn(),
  getLocation: jest.fn(),
  getLocationByNomisLocationId: jest.fn(),
})
