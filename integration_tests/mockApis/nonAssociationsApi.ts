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
}
