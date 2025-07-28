import nock from 'nock'
import config from '../config'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import dummyScheduledEvents from './localMockData/eventsForToday'
import PrisonApiClient from './prisonApiClient'
import {
  accountBalancesMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from './localMockData/miniSummaryMock'
import { prisonerDetailMock } from './localMockData/prisonerDetailMock'
import { mapToQueryString } from '../utils/utils'
import { CaseNotesByTypeA } from './localMockData/caseNotes'
import { inmateDetailMock } from './localMockData/inmateDetailMock'
import { personalCareNeedsMock } from './localMockData/personalCareNeedsMock'
import { secondaryLanguagesMock } from './localMockData/secondaryLanguages'
import { propertyMock } from './localMockData/property'
import { CourtCasesMock } from './localMockData/courtCaseMock'
import { OffenceHistoryMock } from './localMockData/offenceHistoryMock'
import { sentenceTermsMock } from './localMockData/sentenceTermsMock'
import { mockAddresses } from './localMockData/addresses'
import { mockOffenderContacts } from './localMockData/offenderContacts'
import { mockReferenceDomains } from './localMockData/referenceDomains'
import { mockReasonableAdjustments } from './localMockData/reasonableAdjustments'
import { ReferenceCodeDomain } from './interfaces/prisonApi/ReferenceCode'
import AgenciesMock from './localMockData/agenciesDetails'
import { OffenderCellHistoryMock } from './localMockData/offenderCellHistoryMock'
import StaffDetailsMock from './localMockData/staffDetails'
import CsraAssessmentMock from './localMockData/csraAssessmentMock'
import { transactionsMock } from './localMockData/transactionsMock'
import { AccountCode } from './enums/accountCode'
import { damageObligationContainerMock } from './localMockData/damageObligationsMock'
import { MovementType } from './enums/movementType'
import movementsMock from './localMockData/movementsData'
import { appointmentTypesMock } from './localMockData/appointmentTypesMock'
import { offenderSentenceDetailsMock } from './localMockData/offenderSentenceDetailsMock'
import { prisonerSchedulesMock } from './localMockData/prisonerSchedulesMock'
import { GetDetailsMock } from './localMockData/getDetailsMock'
import { mockHistoryForLocation } from './localMockData/getHistoryForLocationMock'
import { getCellMoveReasonTypesMock } from './localMockData/getCellMoveReasonTypesMock'
import { scheduledTransfersMock } from './localMockData/scheduledTransfersMock'
import { beliefHistoryMock } from './localMockData/beliefHistoryMock'
import { mockInmateAtLocation } from './localMockData/locationsInmates'
import { pagedVisitsMock } from './localMockData/pagedVisitsWithVisitors'
import { visitPrisonsMock } from './localMockData/visitPrisons'
import { imageDetailListMock, imageDetailMock } from './localMockData/imageMock'
import { GetIdentifierMock, GetIdentifiersMock } from './localMockData/getIdentifiersMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    prisonApiClient = new PrisonApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulPrisonApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakePrisonApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }
  const mockSuccessfulPrisonApiPost = <TReturnData>(url: string, body: any, returnData: TReturnData) => {
    fakePrisonApi.post(url, body).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCaseLoads', () => {
    it('should return data from api', async () => {
      mockSuccessfulPrisonApiCall('/api/users/me/caseLoads?allCaseloads=true', CaseLoadsDummyDataA)

      const output = await prisonApiClient.getUserCaseLoads()
      expect(output).toEqual(CaseLoadsDummyDataA)
    })
  })

  describe('getAccountBalances', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      fakePrisonApi
        .get(`/api/bookings/${bookingId}/balances`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, accountBalancesMock)

      const output = await prisonApiClient.getAccountBalances(bookingId)
      expect(output).toEqual(accountBalancesMock)
    })
  })

  describe('getVisitSummary', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      fakePrisonApi
        .get(`/api/bookings/${bookingId}/visits/summary`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, visitSummaryMock)

      const output = await prisonApiClient.getVisitSummary(bookingId)
      expect(output).toEqual(visitSummaryMock)
    })
  })

  describe('getVisitBalances', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'A1234BC'
      fakePrisonApi
        .get(`/api/bookings/offenderNo/${prisonerNumber}/visit/balances`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, visitBalancesMock)

      const output = await prisonApiClient.getVisitBalances(prisonerNumber)
      expect(output).toEqual(visitBalancesMock)
    })
  })

  describe('getAssessments', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      fakePrisonApi
        .get(`/api/bookings/${bookingId}/assessments`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, assessmentsMock)

      const output = await prisonApiClient.getAssessments(bookingId)
      expect(output).toEqual(assessmentsMock)
    })
  })

  describe('getEventsScheduledForToday', () => {
    it.each([123456, 654321])('Should return data from the API', async bookingId => {
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/events/today`, dummyScheduledEvents)

      const output = await prisonApiClient.getEventsScheduledForToday(bookingId)
      expect(output).toEqual(dummyScheduledEvents)
    })
  })

  describe('getPrisoner', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'A1234BC'
      mockSuccessfulPrisonApiCall(`/api/prisoners/${prisonerNumber}`, prisonerDetailMock)

      const output = await prisonApiClient.getPrisoner(prisonerNumber)
      expect(output).toEqual(prisonerDetailMock)
    })
  })

  describe('getCaseNoteSummaryByTypes', () => {
    it('Should return data from the API', async () => {
      const params = { type: 'KA', subType: 'KS', numMonths: 38, bookingId: 1102484 }
      fakePrisonApi
        .get(`/api/case-notes/summary?${mapToQueryString(params)}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, CaseNotesByTypeA)

      const output = await prisonApiClient.getCaseNoteSummaryByTypes(params)
      expect(output).toEqual(CaseNotesByTypeA)
    })
  })

  describe('getInmateDetail', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}`, inmateDetailMock)

      const output = await prisonApiClient.getInmateDetail(bookingId)
      expect(output).toEqual(inmateDetailMock)
    })
  })

  describe('getPersonalCareNeeds', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/personal-care-needs?type=MATSTAT`, personalCareNeedsMock)

      const output = await prisonApiClient.getPersonalCareNeeds(bookingId, ['MATSTAT'])
      expect(output).toEqual(personalCareNeedsMock)
    })
  })

  describe('getSecondaryLanguages', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/secondary-languages`, secondaryLanguagesMock)
      const output = await prisonApiClient.getSecondaryLanguages(bookingId)
      expect(output).toEqual(secondaryLanguagesMock)
    })
  })

  describe('getProperty', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/property`, propertyMock)
      const output = await prisonApiClient.getProperty(bookingId)
      expect(output).toEqual(propertyMock)
    })
  })

  describe('getCourtCases', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/court-cases`, CourtCasesMock)
      const output = await prisonApiClient.getCourtCases(bookingId)
      expect(output).toEqual(CourtCasesMock)
    })
  })

  describe('getOffenceHistory', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = '123456'
      mockSuccessfulPrisonApiCall(`/api/bookings/offenderNo/${prisonerNumber}/offenceHistory`, OffenceHistoryMock)
      const output = await prisonApiClient.getOffenceHistory(prisonerNumber)
      expect(output).toEqual(OffenceHistoryMock)
    })
  })

  describe('getSentenceTerms', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(
        `/api/offender-sentences/booking/${bookingId}/sentenceTerms?filterBySentenceTermCodes=IMP&filterBySentenceTermCodes=LIC`,
        sentenceTermsMock,
      )
      const output = await prisonApiClient.getSentenceTerms(bookingId)
      expect(output).toEqual(sentenceTermsMock)
    })
  })

  describe('getAddresses', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'ABC123'
      mockSuccessfulPrisonApiCall(`/api/offenders/${prisonerNumber}/addresses`, mockAddresses)
      const output = await prisonApiClient.getAddresses(prisonerNumber)
      expect(output).toEqual(mockAddresses)
    })
  })

  describe('getAddressesForPerson', () => {
    it('Should return data from the API', async () => {
      const personId = 123456
      mockSuccessfulPrisonApiCall(`/api/persons/${personId}/addresses`, mockAddresses)
      const output = await prisonApiClient.getAddressesForPerson(personId)
      expect(output).toEqual(mockAddresses)
    })
  })

  describe('getOffenderContacts', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'ABC123'
      mockSuccessfulPrisonApiCall(`/api/offenders/${prisonerNumber}/contacts`, mockOffenderContacts)
      const output = await prisonApiClient.getOffenderContacts(prisonerNumber)
      expect(output).toEqual(mockOffenderContacts)
    })
  })

  describe('getReferenceCodesByDomain', () => {
    it.each([ReferenceCodeDomain.Health, ReferenceCodeDomain.HealthTreatments])(
      'Should return data from the API',
      async (domain: ReferenceCodeDomain) => {
        mockSuccessfulPrisonApiCall(
          `/api/reference-domains/domains/${domain}`,
          mockReferenceDomains(ReferenceCodeDomain.Health),
        )
        const output = await prisonApiClient.getReferenceCodesByDomain(domain)
        expect(output).toEqual(mockReferenceDomains(ReferenceCodeDomain.Health))
      },
    )
  })

  describe('getReasonableAdjustments', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulPrisonApiCall('/api/bookings/12345/reasonable-adjustments?type=A,B,C', mockReasonableAdjustments)
      const output = await prisonApiClient.getReasonableAdjustments(12345, ['A', 'B', 'C'])
      expect(output).toEqual(mockReasonableAdjustments)
    })
  })

  describe('hasStaffRole', () => {
    it('Should return data from the API', async () => {
      const staffNumber = 12345
      const agencyId = 'Agency'
      mockSuccessfulPrisonApiCall(`/api/staff/${staffNumber}/${agencyId}/roles/KW`, true)
      const output = await prisonApiClient.hasStaffRole(staffNumber, agencyId, 'KW')
      expect(output).toEqual(true)
    })
  })

  describe('getAgencyDetails', () => {
    it('Should return data from the API', async () => {
      const agencyId = 'Agency'
      mockSuccessfulPrisonApiCall(`/api/agencies/${agencyId}?activeOnly=false`, AgenciesMock)
      const output = await prisonApiClient.getAgencyDetails(agencyId)
      expect(output).toEqual(AgenciesMock)
    })
  })

  describe('getOffenderCellHistory', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(
        `/api/bookings/${bookingId}/cell-history?${mapToQueryString({})}`,
        OffenderCellHistoryMock,
      )
      const output = await prisonApiClient.getOffenderCellHistory(bookingId, {})
      expect(output).toEqual(OffenderCellHistoryMock)
    })
  })

  describe('getStaffDetails', () => {
    it('Should return data from the API', async () => {
      const staffId = '123456'
      mockSuccessfulPrisonApiCall(`/api/users/${staffId}`, StaffDetailsMock)
      const output = await prisonApiClient.getStaffDetails(staffId)
      expect(output).toEqual(StaffDetailsMock)
    })
  })

  describe('getInmatesAtLocation', () => {
    it('Should return data from the API', async () => {
      const locationId = 123456
      mockSuccessfulPrisonApiCall(`/api/locations/${locationId}/inmates`, [mockInmateAtLocation])
      const output = await prisonApiClient.getInmatesAtLocation(locationId)
      expect(output).toEqual([mockInmateAtLocation])
    })
  })

  describe('getCsraAssessment', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123
      const assessmentSeq = 456

      mockSuccessfulPrisonApiCall(
        `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
        CsraAssessmentMock,
      )
      const output = await prisonApiClient.getCsraAssessment(bookingId, assessmentSeq)
      expect(output).toEqual(CsraAssessmentMock)
    })
  })

  describe('getTransactionHistory', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234C'
      const params = { account_code: AccountCode.Spends }
      mockSuccessfulPrisonApiCall(
        `/api/offenders/${prisonerNumber}/transaction-history?account_code=spends`,
        transactionsMock,
      )
      const output = await prisonApiClient.getTransactionHistory(prisonerNumber, params)
      expect(output).toEqual(transactionsMock)
    })
  })

  describe('getDamageObligations', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234C'
      mockSuccessfulPrisonApiCall(
        `/api/offenders/${prisonerNumber}/damage-obligations?status=ACTIVE`,
        damageObligationContainerMock,
      )
      const output = await prisonApiClient.getDamageObligations(prisonerNumber)
      expect(output).toEqual(damageObligationContainerMock)
    })
  })

  describe('getMovement', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234C'
      const movements = movementsMock(prisonerNumber)
      const apiRequest = fakePrisonApi
        .post(`/api/movements/offenders?movementTypes=TRN&movementTypes=CRT&latestOnly=true`, [prisonerNumber])
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, movements)

      const response = await prisonApiClient.getMovements([prisonerNumber], [MovementType.Transfer, MovementType.Court])
      expect(apiRequest.isDone()).toBe(true)
      expect(response).toEqual(movements)
    })
  })

  describe('getAppointmentTypes', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulPrisonApiCall(`/api/reference-domains/scheduleReasons?eventType=APP`, appointmentTypesMock)
      const output = await prisonApiClient.getAppointmentTypes()
      expect(output).toEqual(appointmentTypesMock)
    })
  })

  describe('getSentenceData', () => {
    it('Should return data from the API', async () => {
      const offenderNumbers = ['AB1234C']
      mockSuccessfulPrisonApiPost(`/api/offender-sentences`, offenderNumbers, offenderSentenceDetailsMock)
      const output = await prisonApiClient.getSentenceData(offenderNumbers)
      expect(output).toEqual(offenderSentenceDetailsMock)
    })
  })

  describe('getCourtEvents', () => {
    it('Should return data from the API', async () => {
      const offenderNumbers = ['AB1234C']
      const agencyId = 'MDI'
      const date = '2023-01-01'
      mockSuccessfulPrisonApiPost(
        `/api/schedules/${agencyId}/courtEvents?date=${date}`,
        offenderNumbers,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getCourtEvents(offenderNumbers, agencyId, date)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getVisits', () => {
    it('Should return data from the API', async () => {
      const offenderNumbers = ['AB1234C']
      const agencyId = 'MDI'
      const date = '2023-01-01'
      const timeSlot = 'AM'
      mockSuccessfulPrisonApiPost(
        `/api/schedules/${agencyId}/visits?${mapToQueryString({ date, timeSlot })}`,
        offenderNumbers,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getVisits(offenderNumbers, agencyId, date, timeSlot)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getAppointments', () => {
    it('Should return data from the API', async () => {
      const offenderNumbers = ['AB1234C']
      const agencyId = 'MDI'
      const date = '2023-01-01'
      const timeSlot = 'AM'
      mockSuccessfulPrisonApiPost(
        `/api/schedules/${agencyId}/appointments?${mapToQueryString({ date, timeSlot })}`,
        offenderNumbers,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getAppointments(offenderNumbers, agencyId, date, timeSlot)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getActivities', () => {
    it('Should return data from the API', async () => {
      const offenderNumbers = ['AB1234C']
      const agencyId = 'MDI'
      const date = '2023-01-01'
      const timeSlot = 'AM'
      mockSuccessfulPrisonApiPost(
        `/api/schedules/${agencyId}/activities?${mapToQueryString({ date, timeSlot })}`,
        offenderNumbers,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getActivities(offenderNumbers, agencyId, date, timeSlot)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getExternalTransfers', () => {
    it('Should return data from the API', async () => {
      const offenderNumbers = ['AB1234C']
      const agencyId = 'MDI'
      const date = '2023-01-01'
      mockSuccessfulPrisonApiPost(
        `/api/schedules/${agencyId}/externalTransfers?${mapToQueryString({ date })}`,
        offenderNumbers,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getExternalTransfers(offenderNumbers, agencyId, date)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getActivitiesAtLocation', () => {
    it('Should return data from the API', async () => {
      const locationId = 27000
      const date = '2023-01-01'
      const timeSlot = 'AM'
      const includeSuspended = false
      mockSuccessfulPrisonApiCall(
        `/api/schedules/locations/${locationId}/activities?${mapToQueryString({ date, timeSlot, includeSuspended })}`,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getActivitiesAtLocation(locationId, date, timeSlot, includeSuspended)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getActivityList', () => {
    it('Should return data from the API', async () => {
      const agencyId = 'MDI'
      const locationId = 27000
      const usage = 'USAGE'
      const date = '2023-01-01'
      const timeSlot = 'AM'
      mockSuccessfulPrisonApiCall(
        `/api/schedules/${agencyId}/locations/${locationId}/usage/${usage}?${mapToQueryString({ date, timeSlot })}`,
        prisonerSchedulesMock,
      )
      const output = await prisonApiClient.getActivityList(agencyId, locationId, usage, date, timeSlot)
      expect(output).toEqual(prisonerSchedulesMock)
    })
  })

  describe('getDetails', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234C'
      const fullInfo = true

      mockSuccessfulPrisonApiCall(
        `/api/bookings/offenderNo/${prisonerNumber}?fullInfo=${fullInfo}&csraSummary=${fullInfo}`,
        GetDetailsMock,
      )
      const output = await prisonApiClient.getDetails(prisonerNumber, true)
      expect(output).toEqual(GetDetailsMock)
    })
  })

  describe('getHistoryForLocation', () => {
    it('Should return data from the API', async () => {
      const locationId = 'AB1234C'
      const fromDate = '2020'
      const toDate = '2023'

      mockSuccessfulPrisonApiCall(
        `/api/cell/${locationId}/history?fromDate=${fromDate}&toDate=${toDate}`,
        mockHistoryForLocation(),
      )
      const output = await prisonApiClient.getHistoryForLocation(locationId, fromDate, toDate)
      expect(output).toEqual(mockHistoryForLocation())
    })
  })

  describe('getCellMoveReasonTypes', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulPrisonApiCall('/api/reference-domains/domains/CHG_HOUS_RSN', getCellMoveReasonTypesMock)
      const output = await prisonApiClient.getCellMoveReasonTypes()
      expect(output).toEqual(getCellMoveReasonTypesMock)
    })
  })
  describe('getScheduledTransfers', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234C'
      mockSuccessfulPrisonApiCall(`/api/schedules/${prisonerNumber}/scheduled-transfers`, scheduledTransfersMock)
      const output = await prisonApiClient.getScheduledTransfers(prisonerNumber)
      expect(output).toEqual(scheduledTransfersMock)
    })
  })

  describe('getBeliefHistory', () => {
    it('Should return data from the API for a specific booking', async () => {
      const prisonerNumber = 'AB1234C'
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(
        `/api/offenders/${prisonerNumber}/belief-history?bookingId=${bookingId}`,
        beliefHistoryMock,
      )
      const output = await prisonApiClient.getBeliefHistory(prisonerNumber, bookingId)
      expect(output).toEqual(beliefHistoryMock)
    })

    it('Should return data from the API across all bookings', async () => {
      const prisonerNumber = 'AB1234C'
      const bookingId: number = null
      mockSuccessfulPrisonApiCall(`/api/offenders/${prisonerNumber}/belief-history`, beliefHistoryMock)
      const output = await prisonApiClient.getBeliefHistory(prisonerNumber, bookingId)
      expect(output).toEqual(beliefHistoryMock)
    })
  })

  describe('getVisitsWithVisitors', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/visits-with-visitors?page=1`, pagedVisitsMock)
      const output = await prisonApiClient.getVisitsForBookingWithVisitors(bookingId, { page: 1 })
      expect(output).toEqual(pagedVisitsMock)
    })
  })

  describe('getVisitsPrisons', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulPrisonApiCall(`/api/bookings/${bookingId}/visits/prisons`, visitPrisonsMock)
      const output = await prisonApiClient.getVisitsPrisons(bookingId)
      expect(output).toEqual(visitPrisonsMock)
    })
  })

  describe('getIdentifier', () => {
    it('Should return data from the API', async () => {
      const offenderId = 1
      const seqId = 2
      mockSuccessfulPrisonApiCall(`/api/aliases/${offenderId}/offender-identifiers/${seqId}`, GetIdentifierMock)
      const output = await prisonApiClient.getIdentifier(offenderId, seqId)
      expect(output).toEqual(GetIdentifierMock)
    })
  })

  describe('getIdentifiers', () => {
    it.each([true, false])('Should return data from the API', async (includeAliases: boolean) => {
      const prisonerNumber = 'AB1234C'
      mockSuccessfulPrisonApiCall(
        `/api/offenders/${prisonerNumber}/offender-identifiers?includeAliases=${includeAliases}`,
        GetIdentifiersMock,
      )
      const output = await prisonApiClient.getIdentifiers(prisonerNumber, includeAliases)
      expect(output).toEqual(GetIdentifiersMock)
    })
  })

  describe('getImagesForPrisoner', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'abc123'
      mockSuccessfulPrisonApiCall(`/api/images/offenders/${prisonerNumber}`, imageDetailListMock)
      const output = await prisonApiClient.getImagesForPrisoner(prisonerNumber)
      expect(output).toEqual(imageDetailListMock)
    })
  })

  describe('getImageDetail', () => {
    it('Should return data from the API', async () => {
      const imageId = 1234
      mockSuccessfulPrisonApiCall(`/api/images/${imageId}`, imageDetailMock)
      const output = await prisonApiClient.getImageDetail(imageId)
      expect(output).toEqual(imageDetailMock)
    })
  })
})
