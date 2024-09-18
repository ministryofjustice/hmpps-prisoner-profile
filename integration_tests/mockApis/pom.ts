import { stubFor } from './wiremock'
import { pomMock } from '../../server/data/localMockData/pom'
import Pom from '../../server/data/interfaces/allocationManagerApi/Pom'

export default {
  stubPomData: (resp: Pom = pomMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/allocation/api/allocation/[A-Z0-9]*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubPomDataNotFound: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/allocation/api/allocation/[A-Z0-9]*`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorMessage: 'Not found',
          httpStatusCode: 404,
        },
      },
    })
  },

  stubPomDataError: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/allocation/api/allocation/${prisonerNumber}`,
      },
      response: {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorMessage: 'Service unavailable',
          httpStatusCode: 500,
        },
      },
    })
  },

  stubAllocationApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/allocation/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
