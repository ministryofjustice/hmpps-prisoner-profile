import { stubFor } from './wiremock'

export default {
  stubGetSocNominal: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/soc/soc/nominal/nomsId/G6123VU`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          id: 123456,
        },
      },
    })
  },

  stubGetSocNominal404: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/soc/soc/nominal/nomsId/A1234BC`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },

  stubSocApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/soc/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
