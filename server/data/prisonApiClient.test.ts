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
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { pagedActiveAlertsMock } from './localMockData/pagedAlertsMock'
import { propertyMock } from './localMockData/property'
import { CourtCasesMock } from './localMockData/courtCaseMock'
import { OffenceHistoryMock } from './localMockData/offenceHistoryMock'
import { sentenceTermsMock } from './localMockData/sentenceTermsMock'
import { mockAddresses } from './localMockData/addresses'
import { mockOffenderContacts } from './localMockData/offenderContacts'
import { mockReferenceDomains } from './localMockData/referenceDomains'
import { mockReasonableAdjustments } from './localMockData/reasonableAdjustments'
import { ReferenceCodeDomain } from '../interfaces/prisonApi/referenceCode'
import { caseNoteUsageMock } from './localMockData/caseNoteUsageMock'
import { formatDateISO } from '../utils/dateHelpers'
import { mockStaffRoles } from './localMockData/staffRoles'
import restClientBuilder from '.'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    prisonApiClient = restClientBuilder('Prison API', config.apis.prisonApi, PrisonApiClient)(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulPrisonApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakePrisonApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
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
      const params = { type: 'KA', subType: 'KS', numMonths: 38, bookingId: '1102484' }
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

  describe('getAlerts', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      const queryParams: PagedListQueryParams = { alertStatus: 'ACTIVE' }
      mockSuccessfulPrisonApiCall(
        `/api/bookings/${bookingId}/alerts/v2?size=20&alertStatus=ACTIVE`,
        pagedActiveAlertsMock,
      )

      const output = await prisonApiClient.getAlerts(bookingId, queryParams)
      expect(output).toEqual(pagedActiveAlertsMock)
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
        mockSuccessfulPrisonApiCall(`/api/reference-domains/domains/${domain}`, mockReferenceDomains.health)
        const output = await prisonApiClient.getReferenceCodesByDomain(domain)
        expect(output).toEqual(mockReferenceDomains.health)
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

  describe('getCaseNoteUsage', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234C'
      const today = formatDateISO(new Date())
      mockSuccessfulPrisonApiCall(
        `/api/case-notes/usage?offenderNo=AB1234C&toDate=${today}&numMonths=1200`,
        caseNoteUsageMock,
      )
      const output = await prisonApiClient.getCaseNotesUsage(prisonerNumber)
      expect(output).toEqual(caseNoteUsageMock)
    })
  })

  describe('getStaffRoles', () => {
    it('Should return data from the API', async () => {
      const staffNumber = 12345
      const agencyId = 'Agency'
      mockSuccessfulPrisonApiCall(`/api/staff/${staffNumber}/${agencyId}/roles`, mockStaffRoles)
      const output = await prisonApiClient.getStaffRoles(staffNumber, agencyId)
      expect(output).toEqual(mockStaffRoles)
    })
  })
})
