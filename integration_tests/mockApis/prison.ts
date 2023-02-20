import { stubFor } from './wiremock'
import {
  accountBalancesMock,
  adjudicationSummaryMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../../server/data/localMockData/miniSummaryMock'
import dummyScheduledEvents from '../../server/data/localMockData/eventsForToday'
import nonAssociationsDummyData from '../../server/data/localMockData/nonAssociations'

export default {
  stubNonAssociations: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/non-association-details`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: nonAssociationsDummyData,
      },
    })
  },
  stubAccountBalances: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/balances`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: accountBalancesMock,
      },
    })
  },
  stubAdjudications: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/adjudications`,
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
  stubVisitSummary: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/visits/summary`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitSummaryMock,
      },
    })
  },
  stubVisitBalances: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/offenderNo/${prisonerNumber}/visit/balances`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitBalancesMock,
      },
    })
  },
  stubAssessments: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/assessments`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: assessmentsMock,
      },
    })
  },
  stubEventsForToday: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/events/today`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: dummyScheduledEvents,
      },
    })
  },
}
