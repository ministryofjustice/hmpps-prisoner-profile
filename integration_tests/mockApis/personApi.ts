import type { SuperAgentRequest } from 'superagent'
import { stubGetWithBody } from './utils'
import { stubFor, stubPing } from './wiremock'
import type { PersonRecord } from '../../server/data/interfaces/personApi'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'

export default {
  stubPersonApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/personRecord', httpStatus),

  stubPersonApiGetReligionCodes: ({ activeOnly = false }: { activeOnly?: boolean } = {}) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/personRecord/person/prison/religion-codes',
        queryParameters: { active: { equalTo: activeOnly.toString() } },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: personApiReligionCodesMock,
      },
    }),

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
