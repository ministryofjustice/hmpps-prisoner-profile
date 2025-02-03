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

  stubGetMappingUsingNomisLocationId: (nomisLocationId: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/nomissyncprisonermapping/api/locations/nomis/${nomisLocationId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          dpsLocationId: 'abcde',
          nomisLocationId,
        },
      },
    }),
}
