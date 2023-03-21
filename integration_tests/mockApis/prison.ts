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
import { inmateDetailMock } from '../../server/data/localMockData/inmateDetailMock'
import { prisonerDetailMock } from '../../server/data/localMockData/prisonerDetailMock'
import { secondaryLanguagesMock } from '../../server/data/localMockData/secondaryLanguages'
import { propertyMock } from '../../server/data/localMockData/property'
import { CaseNotesByTypeA } from '../../server/data/localMockData/caseNotes'
import { offenderContact } from '../../server/data/localMockData/offenderContacts'
import { mapToQueryString } from '../../server/utils/utils'
import {
  emptyAlertsMock,
  pagedActiveAlertsMock,
  pagedInactiveAlertsMock,
} from '../../server/data/localMockData/pagedAlertsMock'

const placeHolderImagePath = './../../assets/images/average-face.jpg'

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
  stubKeyWorkerSessions: (params: object) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/case-notes/summary\\?${mapToQueryString(params)}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CaseNotesByTypeA,
      },
    })
  },
  stubGetOffenderContacts: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/contacts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenderContact,
      },
    })
  },
  stubEventsForProfileImage: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/offenderNo/${prisonerNumber}/image/data\\?fullSizeImage=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
        bodyFileName: placeHolderImagePath,
      },
    })
  },

  stubPrisonerDetail: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/prisoners/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerDetailMock,
      },
    })
  },

  stubSecondaryLanguages: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/secondary-languages`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: secondaryLanguagesMock,
      },
    })
  },

  stubProperty: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/property`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: propertyMock,
      },
    })
  },

  stubActiveAlerts: (bookingId: number) => {
    let jsonResp
    if (bookingId === 1102484) {
      jsonResp = pagedActiveAlertsMock
    } else if (bookingId === 1234567) {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/alerts/v2\\?size=20&alertStatus=ACTIVE`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },

  stubInactiveAlerts: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/alerts/v2\\?size=20&page=1&alertStatus=INACTIVE`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedInactiveAlertsMock,
      },
    })
  },

  stubInmateDetail: (bookingId: number) => {
    let jsonResp
    if (bookingId === 1102484) {
      jsonResp = { ...inmateDetailMock, activeAlertCount: 80, inactiveAlertCount: 80 }
    } else if (bookingId === 1234567) {
      jsonResp = {
        ...inmateDetailMock,
        prisonerNumber: 'A1234BC',
        bookingId: 1234567,
        activeAlertCount: 0,
        inactiveAlertCount: 0,
      }
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },
}
