import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import type { PrisonerPropertySummary } from '../../server/data/interfaces/prisonerPropertyApi/prisonerPropertyApiClient'

export default {
  stubPrisonerPropertySummary: ({
    prisonId,
    prisonerNumber,
    response,
  }: {
    prisonId: string
    prisonerNumber: string
    response: PrisonerPropertySummary
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/prisonerProperty/property-containers/prisoner/${prisonerNumber}/summary`,
        queryParameters: {
          prisonId: { equalTo: prisonId },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    }),
}
