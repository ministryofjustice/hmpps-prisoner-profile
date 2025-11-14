import { stubFor } from './wiremock'
import {
  adjudicationSummaryMock,
  adjudicationSummaryWithActiveMock,
} from '../../server/data/localMockData/miniSummaryMock'

export default {
  stubAdjudications: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/adjudications/adjudications/by-booking-id/${bookingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: adjudicationSummaryMock,
      },
    })
  },
  stubAdjudicationsWithActive: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/adjudications/adjudications/by-booking-id/${bookingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: adjudicationSummaryWithActiveMock,
      },
    })
  },
  stubAdjudicationsError: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/adjudications/adjudications/by-booking-id/${bookingId}`,
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
