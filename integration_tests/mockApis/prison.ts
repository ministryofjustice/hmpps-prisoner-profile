import { addDays, format, startOfToday } from 'date-fns'
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
import {
  pastCareNeedsMock,
  personalCareNeedsMock,
  xrayCareNeeds,
} from '../../server/data/localMockData/personalCareNeedsMock'
import { mockReasonableAdjustments } from '../../server/data/localMockData/reasonableAdjustments'
import { CourtCasesMock, CourtCasesUnsentencedMockA } from '../../server/data/localMockData/courtCaseMock'
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
import CaseLoad from '../../server/data/interfaces/prisonApi/CaseLoad'

import {
  fullStatusMock,
  fullStatusRemandMock,
  mainOffenceMock,
} from '../../server/data/localMockData/offenceOverviewMock'
import FullStatus from '../../server/data/interfaces/prisonApi/FullStatus'
import { identifiersMock } from '../../server/data/localMockData/identifiersMock'

import {
  SentenceSummaryWithoutSentenceMock,
  SentenceSummaryWithSentenceMock,
} from '../../server/data/localMockData/sentenceSummaryMock'
import {
  PrisonerScheduleNextWeekMock,
  PrisonerScheduleThisWeekMock,
} from '../../server/data/localMockData/prisonerScheduleMock'
import csraAssessmentMock from '../../server/data/localMockData/csraAssessmentMock'
import csraAssessmentSummaryMock from '../../server/data/localMockData/csraAssessmentSummaryMock'
import staffDetails from '../../server/data/localMockData/staffDetails'
import {
  cashHOATransactionsMock,
  cashTransactionsMock,
  cashWHFTransactionsMock,
  savingsTransactionsMock,
  transactionsMock,
} from '../../server/data/localMockData/transactionsMock'
import { damageObligationContainerMock } from '../../server/data/localMockData/damageObligationsMock'
import agenciesDetails from '../../server/data/localMockData/agenciesDetails'
import movementsMock from '../../server/data/localMockData/movementsData'
import { OffenderAttendanceHistoryMock } from '../../server/data/localMockData/offenderAttendanceHistoryMock'
import { scheduledTransfersMock } from '../../server/data/localMockData/scheduledTransfersMock'

import { GetDetailsMock } from '../../server/data/localMockData/getDetailsMock'
import { mockHistoryForLocation } from '../../server/data/localMockData/getHistoryForLocationMock'
import { getCellMoveReasonTypesMock } from '../../server/data/localMockData/getCellMoveReasonTypesMock'
import HistoryForLocationItem from '../../server/data/interfaces/prisonApi/HistoryForLocationItem'
import InmateDetail from '../../server/data/interfaces/prisonApi/InmateDetail'
import CsraAssessment, { CsraAssessmentSummary } from '../../server/data/interfaces/prisonApi/CsraAssessment'
import { beliefHistoryAllBookingsMock, beliefHistoryMock } from '../../server/data/localMockData/beliefHistoryMock'
import receptionsWithCapacityMock from '../../server/data/localMockData/receptionsWithCapacityMock'
import { OffenderCellHistoryMock } from '../../server/data/localMockData/offenderCellHistoryMock'
import { mockInmateAtLocation } from '../../server/data/localMockData/locationsInmates'
import OffenderCellHistory from '../../server/data/interfaces/prisonApi/OffenderCellHistoryInterface'
import OffenderBooking from '../../server/data/interfaces/prisonApi/OffenderBooking'
import { CaseNoteUsage } from '../../server/data/interfaces/prisonApi/CaseNote'
import { AgencyDetails } from '../../server/data/interfaces/prisonApi/Agency'
import { nextCourtEventMock } from '../../server/data/localMockData/nextCourtEventMock'
import CourtEvent from '../../server/data/interfaces/prisonApi/CourtEvent'
import { ReferenceCodeDomain } from '../../server/data/interfaces/prisonApi/ReferenceCode'
import { mockPagedVisits, pagedVisitsMock } from '../../server/data/localMockData/pagedVisitsWithVisitors'
import { visitPrisonsMock } from '../../server/data/localMockData/visitPrisons'
import VisitWithVisitors from '../../server/data/interfaces/prisonApi/VisitWithVisitors'
import { VisitsListQueryParams } from '../../server/data/interfaces/prisonApi/PagedList'
import { CaseNoteSummaryByTypesParams } from '../../server/data/interfaces/prisonApi/prisonApiClient'
import { stubGetWithBody } from './utils'

const placeHolderImagePath = './../../assets/images/average-face.jpg'

export default {
  stubPrisonApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),

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
  stubKeyWorkerSessions: (params: CaseNoteSummaryByTypesParams) => {
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
  stubGetOffenderContacts: (resp?: never) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/\\d*/contacts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp ?? mockContactDetail,
      },
    })
  },
  stubEventsForProfileImage: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/offenderNo/${prisonerNumber}/image/data\\?fullSizeImage=.*`,
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

  stubAddresses: ({ prisonerNumber, resp = mockAddresses }: { prisonerNumber: string; resp: unknown }) => {
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
        jsonBody: resp,
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

  stubPersonAddresses: (resp?: never) => {
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
        jsonBody: resp ?? mockAddresses,
      },
    })
  },

  stubInmateDetail: ({ bookingId, inmateDetail = {} }: { bookingId: number; inmateDetail: Partial<InmateDetail> }) => {
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
        jsonBody: { ...inmateDetailMock, ...inmateDetail, bookingId },
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
        jsonBody: mockReferenceDomains(ReferenceCodeDomain.Health),
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
        jsonBody: mockReferenceDomains(ReferenceCodeDomain.HealthTreatments),
      },
    })
  },

  stubReferenceCodeDomain: ({ referenceDomain }: { referenceDomain: ReferenceCodeDomain }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/reference-domains/domains/${referenceDomain}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockReferenceDomains(referenceDomain),
      },
    })
  },

  stubReasonableAdjustments: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/reasonable-adjustments/all`,
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

  stubPersonalCareNeeds: (resp = personalCareNeedsMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/\\d*/personal-care-needs\\?type=(.*)`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubAllPersonalCareNeeds: (resp = personalCareNeedsMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/\\d*/personal-care-needs/all`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubAllPastCareNeeds: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/personal-care-needs/all`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pastCareNeedsMock,
      },
    })
  },

  stubPastCareNeeds: (bookingId: number) => {
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
        jsonBody: pastCareNeedsMock,
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
    if (prisonerNumber === 'X9999XX') {
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

  stubGetNextCourtEvent: ({ bookingId, resp = nextCourtEventMock }: { bookingId: number; resp: CourtEvent }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/court/${bookingId}/next-court-event`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubGetCourtCasesCount: ({ bookingId, resp = 5 }: { bookingId: number; resp: number }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/court/${bookingId}/count-active-cases`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubGetIdentifiers: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/offender-identifiers\\?.*`,
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

  stubGetIdentifier: ({ offenderId, seqId }: { offenderId: number; seqId: number }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/aliases/${offenderId}/offender-identifiers/${seqId}.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: identifiersMock[2],
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

  stubHasStaffRole: ({ roleType, response }: { roleType: string; response: boolean }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/staff/\\w+/\\w+/roles/${roleType}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    })
  },

  stubCheckStaffRole: ({ role, staffMemberHasRole }: { role: string; staffMemberHasRole: boolean }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/staff/\\w+/\\w+/roles/${role}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: staffMemberHasRole,
      },
    })
  },

  stubCsraReview: ({
    bookingId,
    assessmentSeq,
    overrides = {},
  }: {
    bookingId: number
    assessmentSeq: number
    overrides: Partial<CsraAssessment>
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { ...csraAssessmentMock, bookingId, assessmentSeq, ...overrides },
      },
    })
  },

  stubCsraHistory: ({
    prisonerNumber,
    overrides = [csraAssessmentSummaryMock],
  }: {
    prisonerNumber: string
    overrides: Partial<CsraAssessmentSummary>[]
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-assessments/csra/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: overrides.map(override => ({
          ...csraAssessmentSummaryMock,
          offenderNo: prisonerNumber,
          ...override,
        })),
      },
    })
  },

  stubGetAgency: ({ agencyId, override }: { agencyId: string; override: Partial<AgencyDetails> }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/agencies/${agencyId}\\?.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          ...agenciesDetails,
          agencyId,
          ...override,
        },
      },
    })
  },

  stubStaffDetails: staffId => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/users/${staffId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: staffDetails,
      },
    })
  },

  stubSpendsTransactions: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/transaction-history.*`,
        queryParameters: {
          account_code: {
            equalTo: 'spends',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: transactionsMock,
      },
    })
  },

  stubPrivateCashTransactions: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/transaction-history.*`,
        queryParameters: {
          account_code: {
            equalTo: 'cash',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cashTransactionsMock,
      },
    })
  },

  stubSpendsHOATransactions: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/transaction-history.*`,
        queryParameters: {
          account_code: {
            equalTo: 'cash',
          },
          transaction_type: {
            equalTo: 'HOA',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cashHOATransactionsMock,
      },
    })
  },

  stubSpendsWHFTransactions: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/transaction-history.*`,
        queryParameters: {
          account_code: {
            equalTo: 'cash',
          },
          transaction_type: {
            equalTo: 'WHF',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cashWHFTransactionsMock,
      },
    })
  },

  stubSavingsTransactions: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/transaction-history.*`,
        queryParameters: {
          account_code: {
            equalTo: 'savings',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: savingsTransactionsMock,
      },
    })
  },

  stubDamageObligations: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/${prisonerNumber}/damage-obligations.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: damageObligationContainerMock,
      },
    })
  },

  stubgetScheduledEventsForNextWeek: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/events/nextWeek`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: PrisonerScheduleNextWeekMock,
      },
    })
  },

  stubgetScheduledEventsForThisWeek: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/events/thisWeek`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: PrisonerScheduleThisWeekMock,
      },
    })
  },

  stubMovements: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prison/api/movements/offenders.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsMock(prisonerNumber, format(addDays(startOfToday(), 10), 'yyyy-MM-dd')),
      },
    })
  },

  stubAttendanceHistory: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offender-activities/${prisonerNumber}/attendance-history.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: OffenderAttendanceHistoryMock(),
      },
    })
  },

  stubPersonEmails: (resp?: never) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/persons/\\d*/emails`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp ?? [{ email: 'email1@email.com' }, { email: 'email2@email.com' }],
      },
    })
  },

  stubGetDetails: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/offenderNo/${prisonerNumber}\\?fullInfo=false&csraSummary=false`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: GetDetailsMock,
      },
    })
  },

  stubPersonPhones: (resp?: never) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/persons/\\d*/phones`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp ?? [{ number: '07700000000', type: 'mobile' }],
      },
    })
  },

  stubScheduledTransfers: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/schedules/${prisonerNumber}/scheduled-transfers`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: scheduledTransfersMock,
      },
    })
  },

  stubGetHistoryForLocation: ({
    nomisLocationId,
    locationHistories,
  }: {
    nomisLocationId: number
    locationHistories: Partial<HistoryForLocationItem>[]
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/cell/${nomisLocationId}/history\\?fromDate=2023-07-11T14:56:16&toDate=2023-08-17T12:00:00`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockHistoryForLocation(locationHistories),
      },
    })
  },

  stubGetCellMoveReasonTypes: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison/api/reference-domains/domains/CHG_HOUS_RSN',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: getCellMoveReasonTypesMock,
      },
    })
  },

  stubBeliefHistory: (bookingId?: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/offenders/.*/belief-history(\\?bookingId=.*)?`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: bookingId ? beliefHistoryMock : beliefHistoryAllBookingsMock,
      },
    })
  },

  stubReceptionsWithCapacity: (agencyId: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/agencies/${agencyId}/receptionsWithCapacity`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: receptionsWithCapacityMock,
      },
    })
  },

  stubCellHistory: ({
    bookingId,
    offenderCellHistory = OffenderCellHistoryMock,
  }: {
    bookingId: number
    offenderCellHistory: OffenderCellHistory
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/cell-history.*`,
        queryParameters: {
          size: {
            equalTo: '10000',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenderCellHistory,
      },
    })
  },

  stubInmatesAtLocation: ({
    locationId,
    overrides = [mockInmateAtLocation],
  }: {
    locationId: number
    overrides: Partial<OffenderBooking>[]
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/locations/${locationId}/inmates`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: overrides.map(override => ({
          ...csraAssessmentSummaryMock,
          ...override,
        })),
      },
    })
  },

  stubVisitsWithVisitors: ({
    bookingId,
    visitsOverrides,
    queryParams,
  }: {
    bookingId: number
    visitsOverrides?: VisitWithVisitors[]
    queryParams?: VisitsListQueryParams
  }) => {
    const queryString = mapToQueryString(queryParams)

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/visits-with-visitors${queryString ? `\\?${queryString}` : ''}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitsOverrides === undefined ? pagedVisitsMock : mockPagedVisits(visitsOverrides),
      },
    })
  },

  stubVisitPrisons: ({ bookingId }: { bookingId: number }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/bookings/${bookingId}/visits/prisons`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitPrisonsMock,
      },
    })
  },

  stubGetLatestArrivalDate: (resp?: never) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison/api/movements/offenders/[a-zA-Z][0-9]{4}[a-zA-Z]{2}/latest-arrival-date',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp ?? '2000-01-01',
      },
    })
  },

  stubImageDetails: () => {
    return stubGetWithBody({
      path: '/prison/api/images/\\d*',
      body: {
        imageId: 1234,
        active: true,
        captureDateTime: '2015-02-11T08:32:50',
      },
    })
  },

  stubImagesForOffender: (prisonerNumber: string) => {
    return stubGetWithBody({
      path: `/prison/api/images/offenders/${prisonerNumber}`,
      body: [
        {
          imageId: inmateDetailMock.facialImageId,
          active: true,
          captureDateTime: '2025-01-11T08:32:50',
          imageView: 'FACE',
        },
        {
          imageId: 4321,
          active: false,
          captureDateTime: '2024-01-11T08:32:50',
          imageView: 'FACE',
        },
      ],
    })
  },
}
