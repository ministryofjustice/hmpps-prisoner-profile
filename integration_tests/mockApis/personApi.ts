import { stubGetWithBody } from './utils'
import { stubFor } from './wiremock'
import { PersonRecord } from '../../server/data/personApiClient'

export default {
  stubPersonApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/person/health/ping',
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
      path: `/person/prisoner-number/${prisonerNumber}`,
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
        urlPattern: `/person/prisoner-number/${prisonerNumber}`,
      },
      response: {
        status: 404,
      },
    }),

  stubPersonApiGetRecordError: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/person/prisoner-number/${prisonerNumber}`,
      },
      response: {
        status: 500,
      },
    }),
}
