import { stubFor } from './wiremock'
import { keyWorkerMock } from '../../server/data/localMockData/keyWorker'

export default {
  stubKeyWorkerData: ({
    prisonerNumber,
    notFound = false,
    error = false,
  }: {
    prisonerNumber: string
    notFound: boolean
    error: boolean
  }) => {
    // eslint-disable-next-line no-nested-ternary
    const response = error
      ? {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
          },
        }
      : notFound
        ? {
            status: 404,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {
              errorMessage: 'Not found',
              httpStatusCode: 404,
            },
          }
        : {
            status: 200,
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody: keyWorkerMock,
          }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/key-worker/offender/${prisonerNumber}`,
      },
      response,
    })
  },

  stubKeyworkerApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/keyworker/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
