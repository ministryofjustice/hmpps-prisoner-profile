import { stubFor } from './wiremock'
import { keyWorkerMock } from '../../server/data/localMockData/keyWorker'

export default {
  stubKeyWorkerData: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/key-worker/offender/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: keyWorkerMock,
      },
    })
  },
}
