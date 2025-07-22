import { stubFor } from './wiremock'
import { incentiveReviewsMock } from '../../server/data/localMockData/incentiveReviewsMock'

export default {
  stubGetReviews: ({ prisonerNumber, bookingId }: { prisonerNumber: string; bookingId: number }) => {
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
        jsonBody: {
          ...incentiveReviewsMock,
          bookingId,
        },
      },
    })
  },
}
