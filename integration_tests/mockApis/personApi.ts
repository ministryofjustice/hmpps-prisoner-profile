import type { SuperAgentRequest } from 'superagent'
import { stubGetWithBody } from './utils'
import { stubFor, stubPing } from './wiremock'
import {
  mockPersonRecord,
  mockPersonRecordWithReligionHistory,
} from '../../server/data/localMockData/personApi/personRecordMock'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'
import { PersonRecord } from '../../server/data/interfaces/personApi'

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
    withReligionHistory = false,
  }: {
    prisonerNumber: string
    prisonNumbers?: string[]
    personRecord: PersonRecord
    withReligionHistory?: boolean
  }) {
    const record = personRecord ?? (withReligionHistory ? mockPersonRecordWithReligionHistory : mockPersonRecord)
    return stubGetWithBody({
      path: withReligionHistory
        ? `/personRecord/person/prison/dps/${prisonerNumber}`
        : `/personRecord/person/prison/${prisonerNumber}`,
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
}
