import { stubFor } from './wiremock'
import { incentiveReviewsMock } from '../../server/data/localMockData/incentiveReviewsMock'

export default {
  stubGetReviews: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/incentives/iep/reviews/booking/${bookingId}`,
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
