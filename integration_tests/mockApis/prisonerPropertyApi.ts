import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import type { PrisonerPropertySummary } from '../../server/data/interfaces/prisonerPropertyApi'

export default {
  /** The prisons the property service is switched on for, from the api's public /info endpoint. */
  stubPropertyActiveAgencies: (activeAgencies: string[] = []): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/prisonerProperty/info',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { activeAgencies },
      },
    }),

  stubPrisonerPropertySummary: ({
    prisonerNumber,
    response,
  }: {
    prisonerNumber: string
    response: PrisonerPropertySummary
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/prisonerProperty/property-containers/prisoner/${prisonerNumber}/summary`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    }),
}
