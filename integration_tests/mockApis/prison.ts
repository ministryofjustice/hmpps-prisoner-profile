import { stubFor } from './wiremock'
import {
  accountBalancesMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../../server/data/localMockData/miniSummaryMock'
import dummyScheduledEvents from '../../server/data/localMockData/eventsForToday'
import { inmateDetailMock } from '../../server/data/localMockData/inmateDetailMock'
import { prisonerDetailMock } from '../../server/data/localMockData/prisonerDetailMock'
import { secondaryLanguagesMock } from '../../server/data/localMockData/secondaryLanguages'
import { propertyMock } from '../../server/data/localMockData/property'
import { mockAddresses } from '../../server/data/localMockData/addresses'
import { mockOffenderContacts } from '../../server/data/localMockData/offenderContacts'
import { CaseNotesByTypeA } from '../../server/data/localMockData/caseNotes'
import { mockContactDetail } from '../../server/data/localMockData/contactDetail'
import { mapToQueryString } from '../../server/utils/utils'
import { mockReferenceDomains } from '../../server/data/localMockData/referenceDomains'
import { personalCareNeedsMock, xrayCareNeeds } from '../../server/data/localMockData/personalCareNeedsMock'
import { mockReasonableAdjustments } from '../../server/data/localMockData/reasonableAdjustments'
import {
  emptyAlertsMock,
  pagedActiveAlertsMock,
  pagedActiveAlertsMockFiltered,
  pagedActiveAlertsMockPage2,
  pagedActiveAlertsMockSorted,
  pagedInactiveAlertsMock,
} from '../../server/data/localMockData/pagedAlertsMock'
import {
  CourtCasesMock,
  CourtCasesSentencedMockA,
  CourtCasesUnsentencedMockA,
  CourtCaseWithNextCourtAppearance,
} from '../../server/data/localMockData/courtCaseMock'
import { OffenceHistoryMock } from '../../server/data/localMockData/offenceHistoryMock'
import { MappedUnsentencedCourtCasesMock, sentenceTermsMock } from '../../server/data/localMockData/sentenceTermsMock'
import {
  CourtDateResultsMock,
  CourtDateResultsUnsentencedMockA,
} from '../../server/data/localMockData/courtDateResultsMock'
import { prisonerSentenceDetailsMock } from '../../server/data/localMockData/prisonerSentenceDetails'
import { caseNoteUsageMock } from '../../server/data/localMockData/caseNoteUsageMock'
import { caseNoteCountMock } from '../../server/data/localMockData/caseNoteCountMock'
import { CaseLoadsDummyDataA } from '../../server/data/localMockData/caseLoad'
import { CaseLoad } from '../../server/interfaces/caseLoad'
import { CaseNoteUsage } from '../../server/interfaces/prisonApi/caseNoteUsage'

import {
  fullStatusMock,
  fullStatusRemandMock,
  mainOffenceMock,
} from '../../server/data/localMockData/offenceOverviewMock'
import { FullStatus } from '../../server/interfaces/prisonApi/fullStatus'
import { identifiersMock } from '../../server/data/localMockData/identifiersMock'
import { StaffRole } from '../../server/interfaces/prisonApi/staffRole'

import {
  SentenceSummaryWithoutSentenceMock,
  SentenceSummaryWithSentenceMock,
} from '../../server/data/localMockData/sentenceSummaryMock'
import { alertTypesMock } from '../../server/data/localMockData/alertTypesMock'

const placeHolderImagePath = './../../assets/images/average-face.jpg'

export default {
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
        jsonBody: mockContactDetail,
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

  stubAddresses: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/addresses`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockAddresses,
      },
    })
  },

  stubOffenderContacts: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/contacts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockOffenderContacts,
      },
    })
  },

  stubPersonAddresses: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison/api/persons/(\\d*)/addresses',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockAddresses,
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

  stubActiveAlertsPage2: (bookingId: number) => {
    let jsonResp
    if (bookingId === 1102484) {
      jsonResp = pagedActiveAlertsMockPage2
    } else if (bookingId === 1234567) {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/alerts/v2\\?size=20&page=1&alertStatus=ACTIVE`,
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

  stubActiveAlertsSorted: (bookingId: number) => {
    let jsonResp
    if (bookingId === 1102484) {
      jsonResp = pagedActiveAlertsMockSorted
    } else if (bookingId === 1234567) {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/alerts/v2\\?size=20&sort=dateCreated%2CASC&alertStatus=ACTIVE`,
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

  stubActiveAlertsFiltered: (bookingId: number) => {
    let jsonResp
    if (bookingId === 1102484) {
      jsonResp = pagedActiveAlertsMockFiltered
    } else if (bookingId === 1234567) {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/alerts/v2\\?size=20&alertType=R&alertStatus=ACTIVE`,
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

  stubImages: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/images/(\\d*)/data\\?fullSizeImage=true`,
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

  stubHealthReferenceDomain: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/reference-domains/domains/HEALTH`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockReferenceDomains.health,
      },
    })
  },

  stubHealthTreatmentReferenceDomain: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/reference-domains/domains/HEALTH_TREAT`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockReferenceDomains.healthTreatment,
      },
    })
  },

  stubReasonableAdjustments: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/reasonable-adjustments\\?type=(.*)`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockReasonableAdjustments,
      },
    })
  },

  stubPersonalCareNeeds: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/personal-care-needs\\?type=(.*)`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: personalCareNeedsMock,
      },
    })
  },

  stubXrayCareNeeds: ({ bookingId, numberOfXrays }: { bookingId: number; numberOfXrays: number }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/personal-care-needs\\?type=(.*)`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: xrayCareNeeds(numberOfXrays),
      },
    })
  },

  stubGetCourtCasesSentenced: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/court-cases`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CourtCasesMock,
      },
    })
  },

  stubGetCourtCasesUnsentenced: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/court-cases`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CourtCasesUnsentencedMockA,
      },
    })
  },

  stubGetOffenceHistory: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/offenderNo/${prisonerNumber}/offenceHistory`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: OffenceHistoryMock,
      },
    })
  },

  stubGetSentenceTermsSentenced: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-sentences/booking/${bookingId}/sentenceTerms\\?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: sentenceTermsMock,
      },
    })
  },

  stubGetSentenceTermsUnsentenced: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-sentences/booking/${bookingId}/sentenceTerms\\?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: MappedUnsentencedCourtCasesMock,
      },
    })
  },

  stubGetPrisonerSentenceDetails: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/sentences`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerSentenceDetailsMock,
      },
    })
  },

  stubGetCourtDateResultsSentenced: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/court-date-results/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CourtDateResultsMock,
      },
    })
  },

  stubGetCourtDateResultsUnsentenced: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/court-date-results/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CourtDateResultsUnsentencedMockA,
      },
    })
  },

  stubGetCaseNotesUsage: (prisonerNumber: string) => {
    let jsonResp: CaseNoteUsage[]
    if (prisonerNumber === 'G6123VU') {
      jsonResp = caseNoteUsageMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = []
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/case-notes/usage\\?offenderNo=${prisonerNumber}&(.*)`,
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

  stubGetCaseNoteCount: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/caseNotes/(.*)`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseNoteCountMock,
      },
    })
  },

  stubUserCaseLoads: (caseLoads: CaseLoad[] = []) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/users/me/caseLoads\\?allCaseloads=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseLoads.length > 0 ? caseLoads : CaseLoadsDummyDataA,
      },
    })
  },

  stubGetMainOffence: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/mainOffence`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mainOffenceMock,
      },
    })
  },

  stubGetFullStatus: (prisonerNumber: string) => {
    let jsonResp: FullStatus
    if (prisonerNumber === 'ONREMAND') {
      jsonResp = fullStatusRemandMock
    } else {
      jsonResp = fullStatusMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/prisoners/${prisonerNumber}/full-status`,
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

  stubGetCourtCases: (bookingId: number) => {
    let jsonResp
    if (bookingId === 1234568) {
      jsonResp = CourtCaseWithNextCourtAppearance
    } else {
      jsonResp = CourtCasesSentencedMockA
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/court-cases`,
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

  stubGetIdentifiers: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/identifiers`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: identifiersMock,
      },
    })
  },

  stubGetSentenceSummaryWithSentence: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/booking/latest/sentence-summary`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: SentenceSummaryWithSentenceMock,
      },
    })
  },

  stubGetSentenceSummaryWithoutSentence: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/booking/latest/sentence-summary`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: SentenceSummaryWithoutSentenceMock,
      },
    })
  },

  stubGetStaffRoles: (roles: StaffRole[]) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/staff/(.*)/(.*)/roles`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: roles,
      },
    })
  },

  stubGetAlertTypes: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/reference-domains/domains/ALERT\\?withSubCodes=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alertTypesMock,
      },
    })
  },

  stubCreateAlert: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prison/api/bookings/1102484/alert`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedActiveAlertsMock.content[0],
      },
    })
  },
}
