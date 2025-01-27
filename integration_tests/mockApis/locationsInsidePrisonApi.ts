import { stubFor } from './wiremock'
import { GetAttributesForLocation } from '../../server/data/localMockData/getAttributesForLocationMock'

export default {
  stubLocationsInsidePrisonApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/locationsinsideprison/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),

  stubGetLocation: (dpsLocationId: string) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/locationsinsideprison/locations/${dpsLocationId}\\?formatLocalName=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          id: dpsLocationId,
          key: 'LEI-1-1',
          localName: 'A special cell',
          specialistCellTypes: ['SAFE_CELL', 'CAT_A'],
        },
      },
    }),
  stubGetAttributesForLocation: (dpsLocationId: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/locationsinsideprison/locations/${dpsLocationId}/attributes`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: GetAttributesForLocation,
      },
    })
  },
}
