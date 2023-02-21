import { stubFor } from './wiremock'
import { pomMock } from '../../server/data/localMockData/pom'

export default {
  stubPomData: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/allocation/api/allocation/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pomMock,
      },
    })
  },
}