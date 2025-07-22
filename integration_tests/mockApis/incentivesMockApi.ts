import { stubFor } from './wiremock'
import { incentiveReviewsMock } from '../../server/data/localMockData/incentiveReviewsMock'

export default {
  stubGetReviews: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/incentives/incentive-reviews/prisoner/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: incentiveReviewsMock,
      },
    })
  },
}
