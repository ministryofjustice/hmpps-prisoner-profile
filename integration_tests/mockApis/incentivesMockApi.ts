import { stubFor } from './wiremock'
import {
  incentiveReviewsMock,
  incentiveReviewsWithDetailsMock,
} from '../../server/data/localMockData/incentiveReviewsMock'

export default {
  stubGetReviews: (params: { bookingId: number; withDetails?: boolean }) => {
    const urPattern = params.withDetails
      ? `/incentives/incentive-reviews/booking/${params.bookingId}\\?withDetails=true`
      : `/incentives/incentive-reviews/booking/${params.bookingId}`

    let jsonBody = incentiveReviewsMock
    if (params.withDetails) {
      jsonBody = params.bookingId === 1102484 ? incentiveReviewsWithDetailsMock : null
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: urPattern,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody,
      },
    })
  },
}
