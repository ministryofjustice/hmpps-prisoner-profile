import { stubFor } from './wiremock'

export default {
  stubGetPathfinderNominal: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/pathfinder/pathfinder/nominal/noms-id/G6123VU`,
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

  stubGetPathfinderNominal404: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/pathfinder/pathfinder/nominal/noms-id/A1234BC`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },

  stubPathfinderApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/pathfinder/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
