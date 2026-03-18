import { stubFor } from './wiremock'
import { incentiveReviewsMock } from '../../server/data/localMockData/incentiveReviewsMock'

export default {
  stubGetReviews: ({
    prisonerNumber,
    bookingId,
    nextReviewDate,
  }: {
    prisonerNumber: string
    bookingId: number
    nextReviewDate?: string
  }) => {
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
          ...(nextReviewDate && { nextReviewDate }),
        },
      },
    })
  },
  stubGetReviewsError: ({ prisonerNumber }: { prisonerNumber: string }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/incentives/incentive-reviews/prisoner/${prisonerNumber}`,
      },
      response: {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          error: 'Something went wrong',
        },
      },
    })
  },
}
