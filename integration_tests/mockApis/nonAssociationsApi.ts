import nonAssociationDetailsDummyData from '../../server/data/localMockData/nonAssociations'
import { stubFor } from './wiremock'

export default {
  stubNonAssociations: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/nonassociations/legacy/api/offenders/${prisonerNumber}/non-association-details.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: nonAssociationDetailsDummyData,
      },
    })
  },
}
