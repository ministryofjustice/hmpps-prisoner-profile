import { stubFor } from './wiremock'
import type LocationsApiLocation from '../../server/data/interfaces/locationsInsidePrisonApi/LocationsApiLocation'
import { GetAttributesForLocation } from '../../server/data/localMockData/getAttributesForLocationMock'
import { locationsApiMock } from '../../server/data/localMockData/locationsMock'

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

  stubGetLocation: ({ dpsLocationId, response }: { dpsLocationId: string; response?: LocationsApiLocation }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/locationsinsideprison/locations/${dpsLocationId}`,
        queryParameters: { formatLocalName: { equalTo: 'true' } },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response ?? {
          id: dpsLocationId,
          key: 'LEI-1-1',
          localName: 'A special cell',
          specialistCellTypes: ['SAFE_CELL', 'CAT_A'],
        },
      },
    }),

  stubGetLocationByKey: ({ key, response }: { key: string; response?: LocationsApiLocation }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/locationsinsideprison/locations/key/${key}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response ?? {
          id: 'location-1',
          key,
          localName: 'A special cell',
        },
      },
    }),

  stubGetLocationsForAppointments: ({ prisonId, response }: { prisonId: string; response?: LocationsApiLocation[] }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/locationsinsideprison/locations/prison/${prisonId}/non-residential-usage-type/APPOINTMENT`,
        queryParameters: {
          sortByLocalName: { equalTo: 'true' },
          formatLocalName: { equalTo: 'true' },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response ?? locationsApiMock,
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
