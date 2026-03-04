import { stubGetWithBody } from './utils'
import { stubFor } from './wiremock'
import { PersonRecord } from '../../server/data/personApiClient'

export default {
  stubPersonApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/personRecord/health/ping',
      },
      response: {
        status: httpStatus,
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
      } as PersonRecord,
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
