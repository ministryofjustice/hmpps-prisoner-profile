import { stubFor } from './wiremock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'

export default {
  stubPrisonerData: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prisonersearch/prisoner/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: PrisonerMockDataA,
      },
    })
  },
}
