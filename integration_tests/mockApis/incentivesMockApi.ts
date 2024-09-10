import { stubFor } from './wiremock'
import { incentiveReviewsMock } from '../../server/data/localMockData/incentiveReviewsMock'

export default {
  stubGetReviews: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/incentives/incentive-reviews/booking/${bookingId}`,
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

  stubIncentivesApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/incentives/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
