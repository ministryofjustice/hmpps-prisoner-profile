import { stubFor } from './wiremock'
import { keyWorkerMock } from '../../server/data/localMockData/keyWorker'

export default {
  stubKeyWorkerData: ({ prisonerNumber, error = false }: { prisonerNumber: string; error: boolean }) => {
    const response = error
      ? {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
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
}
