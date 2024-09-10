import { stubFor } from './wiremock'
import { prisonerNonAssociationsMock } from '../../server/data/localMockData/prisonerNonAssociationsMock'

export default {
  stubNonAssociations: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/nonassociations/prisoner/${prisonerNumber}/non-associations.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerNonAssociationsMock,
      },
    })
  },

  stubNonAssociationsError: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/nonassociations/prisoner/${prisonerNumber}/non-associations.*`,
      },
      response: {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorMessage: 'Service unavailable',
          httpStatusCode: 500,
        },
      },
    })
  },

  stubNonAssociationsApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/nonassociations/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
