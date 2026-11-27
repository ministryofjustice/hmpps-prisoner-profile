import type { SuperAgentRequest } from 'superagent'
import { stubGetWithBody } from './utils'
import { stubFor, stubPing } from './wiremock'
import type { PersonRecord, ReligionHistoryItem, UpdateReligionRequest } from '../../server/data/interfaces/personApi'
import { mockPersonRecord } from '../../server/data/localMockData/personApi/personRecordMock'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'

export default {
  stubPersonApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/personRecord', httpStatus),

  stubPersonApiGetReligionCodes: ({ activeOnly = false }: { activeOnly?: boolean } = {}) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/personRecord/person/reference-data/religion-codes',
        queryParameters: { active: { equalTo: activeOnly.toString() } },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: personApiReligionCodesMock,
      },
    }),

  stubPersonApiGetRecord({
    prisonerNumber,
    prisonNumbers,
    personRecord,
  }: {
    prisonerNumber: string
    prisonNumbers?: string[]
    personRecord: PersonRecord
  }) {
    const record = personRecord ?? mockPersonRecord
    return stubGetWithBody({
      path: `/personRecord/person/prison/${prisonerNumber}`,
      body: {
        ...record,
        identifiers: {
          ...record.identifiers,
          prisonNumbers: prisonNumbers ?? [prisonerNumber],
        },
      },
    })
  },

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

  stubPersonApiGetReligionHistory: ({
    prisonerNumber,
    response = [],
  }: {
    prisonerNumber: string
    response?: ReligionHistoryItem[]
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/personRecord/person/prison/${prisonerNumber}/religion-history`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubPersonApiUpdateReligion: ({
    prisonerNumber,
    request,
  }: {
    prisonerNumber: string
    request: UpdateReligionRequest
  }) =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/personRecord/person/prison/${prisonerNumber}/religion`,
        bodyPatterns: [{ equalToJson: request }],
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
}
