import { stubFor } from './wiremock'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import { Prisoner } from '../../server/interfaces/prisoner'

export default {
  stubPrisonerData: ({
    prisonerNumber,
    restrictedPatient,
    overrides = {},
  }: {
    prisonerNumber: string
    restrictedPatient?: boolean
    overrides?: Partial<Prisoner>
  }) => {
    let jsonResp
    const url = `/prisonersearch/prisoner/${prisonerNumber}`
    if (prisonerNumber === 'G6123VU') {
      jsonResp = { ...PrisonerMockDataA, restrictedPatient }
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = { ...PrisonerMockDataA, prisonerNumber: 'A1234BC', bookingId: 1234567, restrictedPatient }
    }
    jsonResp = { ...jsonResp, ...overrides }
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
