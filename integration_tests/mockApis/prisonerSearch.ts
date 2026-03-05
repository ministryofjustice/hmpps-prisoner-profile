import { stubGetWithBody, stubPostWithResponse } from './utils'
import { stubFor } from './wiremock'
import { PrisonerMockDataA, PrisonerOnRemandMockData } from '../../server/data/localMockData/prisoner'
import Prisoner from '../../server/data/interfaces/prisonerSearchApi/Prisoner'

export default {
  stubPrisonerSearchPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisonersearch/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),

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
    } else if (prisonerNumber === 'X9999XX') {
      jsonResp = { ...PrisonerOnRemandMockData, prisonerNumber: 'X9999XX', bookingId: 1234568, restrictedPatient }
    }
    jsonResp = { ...jsonResp, prisonId: restrictedPatient ? 'OUT' : jsonResp.prisonId, ...overrides }
    return stubGetWithBody({
      path: url,
      body: jsonResp,
    })
  },

  stubPrisonerSearchFindByNumbers: ({ prisoners }: { prisoners: Prisoner[] }) =>
    stubPostWithResponse({
      path: '/prisonersearch/prisoner-search/prisoner-numbers',
      responseBody: prisoners,
    }),

  stubPrisonerSearchFindByNumbersError: () =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/prisonersearch/prisoner-search/prisoner-numbers',
      },
      response: {
        status: 500,
      },
    }),
}
