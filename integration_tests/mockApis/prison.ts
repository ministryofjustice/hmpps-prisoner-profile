import { stubFor } from './wiremock'
import {
  accountBalancesMock,
  adjudicationSummaryMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../../server/data/localMockData/miniSummaryMock'

const nonAssociationA = {
  offenderNo: 'ABC123',
  firstName: 'John',
  lastName: 'Doe',
  reasonCode: 'VIC',
  reasonDescription: 'Victim',
  agencyDescription: 'Moorland (HMP & YOI)',
  assignedLivingUnitDescription: 'NMI-RECP',
  assignedLivingUnitId: 1234,
}

const nonAssociationDetailA = {
  reasonCode: 'VIC',
  reasonDescription: 'Victim',
  typeCode: 'LAND',
  typeDescription: 'Do Not Locate on Same Landing',
  effectiveDate: '1980-01-01T00:00:00',
  offenderNonAssociation: nonAssociationA,
  expiryDate: '2020-07-17T00:00:00',
  comments: 'Gang violence',
  authorisedBy: 'Someone',
}

const nonAssociationB = {
  offenderNo: 'DEF321',
  firstName: 'Guy',
  lastName: 'Incognito',
  reasonCode: 'RIV',
  reasonDescription: 'Rival Gang',
  agencyDescription: 'Moorland (HMP & YOI)',
  assignedLivingUnitDescription: 'NMI-RECP',
  assignedLivingUnitId: 1234,
}

const nonAssociationDetailB = {
  reasonCode: 'VIC',
  reasonDescription: 'Victim',
  typeCode: 'LAND',
  typeDescription: 'Do Not Locate on Same Landing',
  effectiveDate: '2020-07-01T00:00:00',
  expiryDate: '2020-07-17T00:00:00',
  comments: 'hjkhjkhjkhkhkj hjkhjkhjkhjkhjk',
  authorisedBy: 'Jane Doe',
  offenderNonAssociation: nonAssociationB,
}

const nonAssociationDetailsDummyData = {
  offenderNo: 'G6123VU',
  firstName: 'John',
  lastName: 'Saunders',
  agencyDescription: 'Moorland (HMP & YOI)',
  assignedLivingUnitDescription: 'MDI-5-1-A-012',
  assignedLivingUnitId: 26019,
  nonAssociations: [nonAssociationDetailA, nonAssociationDetailB],
}

const scheduledEventsMock = [
  {
    bookingId: 123456,
    eventClass: 'INT_MOV',
    eventId: 54321,
    eventStatus: 'SCH',
    eventType: 'PRISON_ACT',
    eventTypeDesc: 'Prison Activities',
    eventSubType: 'PA',
    eventSubTypeDesc: 'Prison Activities',
    eventDate: '2023-02-14',
    startTime: '2023-02-14T08:30:00',
    endTime: '2023-02-14T11:45:00',
    eventLocation: 'WORKSHOP 16 - JOINERY',
    eventLocationId: 27026,
    eventSource: 'PA',
    eventSourceCode: 'JOINERY_AM',
    eventSourceDesc: 'Joinery AM',
    paid: false,
    payRate: 1.05,
    locationCode: 'WS16',
  },
  {
    bookingId: 123456,
    eventClass: 'INT_MOV',
    eventId: 54321,
    eventStatus: 'SCH',
    eventType: 'PRISON_ACT',
    eventTypeDesc: 'Prison Activities',
    eventSubType: 'PA',
    eventSubTypeDesc: 'Prison Activities',
    eventDate: '2023-02-14',
    startTime: '2023-02-14T13:15:00',
    endTime: '2023-02-14T16:15:00',
    eventLocation: 'WORKSHOP 16 - JOINERY',
    eventLocationId: 27026,
    eventSource: 'PA',
    eventSourceCode: 'JOINERY_PM',
    eventSourceDesc: 'Joinery PM',
    paid: false,
    payRate: 1.05,
    locationCode: 'WS16',
  },
  {
    bookingId: 123456,
    eventClass: 'INT_MOV',
    eventStatus: 'SCH',
    eventType: 'APP',
    eventTypeDesc: 'Appointment',
    eventSubType: 'GYMF',
    eventSubTypeDesc: 'Gym - Football',
    eventDate: '2023-02-14',
    startTime: '2023-02-14T18:00:00',
    endTime: '2023-02-14T19:00:00',
    eventLocation: 'GYM',
    eventSource: 'APP',
    eventSourceCode: 'APP',
    eventSourceDesc: 'test',
  },
  {
    bookingId: 123456,
    eventClass: 'INT_MOV',
    eventStatus: 'SCH',
    eventType: 'APP',
    eventTypeDesc: 'Appointment',
    eventSubType: 'VLB',
    eventSubTypeDesc: 'VLB - Test',
    eventDate: '2023-02-14',
    startTime: '2023-02-14T18:00:00',
    endTime: '2023-02-14T19:00:00',
    eventLocation: 'OFFICIAL VISITS',
    eventSource: 'APP',
    eventSourceCode: 'APP',
    eventSourceDesc: 'test',
  },
]

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
        jsonBody: nonAssociationDetailsDummyData,
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
        jsonBody: scheduledEventsMock,
      },
    })
  },
}
