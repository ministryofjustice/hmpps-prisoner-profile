import { stubFor } from './wiremock'

export default {
  stubNomisSyncPrisonerMappingApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/nomissyncprisonermapping/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
