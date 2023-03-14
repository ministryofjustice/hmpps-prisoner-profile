import { stubFor } from './wiremock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'

export default {
  stubPrisonerData: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = PrisonerMockDataA
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = { ...PrisonerMockDataA, prisonerNumber: 'A1234BC', bookingId: 1234567 }
    }
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
        jsonBody: jsonResp,
      },
    })
  },
}
