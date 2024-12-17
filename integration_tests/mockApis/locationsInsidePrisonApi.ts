import { stubFor } from './wiremock'

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
}
