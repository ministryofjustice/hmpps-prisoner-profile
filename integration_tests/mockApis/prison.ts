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
}
