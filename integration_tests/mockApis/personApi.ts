import type { SuperAgentRequest } from 'superagent'
import { stubGetWithBody } from './utils'
import { stubFor, stubPing } from './wiremock'
import type { PersonRecord } from '../../server/data/interfaces/personApi'

export default {
  stubPersonApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/personRecord', httpStatus),

  stubPersonApiGetRecord: ({
    prisonerNumber,
    prisonNumbers = [],
  }: {
    prisonerNumber: string
    prisonNumbers?: string[]
  }) =>
    stubGetWithBody({
      path: `/personRecord/person/prison/${prisonerNumber}`,
      body: {
        identifiers: {
          prisonNumbers,
        },
      } satisfies PersonRecord,
    }),

  stubPersonApiGetRecordNotFound: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/personRecord/person/prison/${prisonerNumber}`,
      },
      response: {
        status: 404,
      },
    }),

  stubPersonApiGetRecordError: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/personRecord/person/prison/${prisonerNumber}`,
      },
      response: {
        status: 500,
      },
    }),
}
