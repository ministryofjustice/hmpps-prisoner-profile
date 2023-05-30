import { stubFor } from './wiremock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'

export default {
  stubPrisonerData: ({ prisonerNumber, restrictedPatient }) => {
    let jsonResp
    const url = `/prisonersearch/prisoner/${prisonerNumber}`
    if (prisonerNumber === 'G6123VU') {
      jsonResp = { ...PrisonerMockDataA, restrictedPatient }
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = { ...PrisonerMockDataA, prisonerNumber: 'A1234BC', bookingId: 1234567, restrictedPatient }
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: url,
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
