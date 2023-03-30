import nock from 'nock'
import config from '../config'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import dummyScheduledEvents from './localMockData/eventsForToday'
import { LocationDummyDataC } from './localMockData/locations'
import nonAssociationDetailsDummyData from './localMockData/nonAssociations'
import PrisonApiClient from './prisonApiClient'
import {
  accountBalancesMock,
  adjudicationSummaryMock,
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
import { mockAddresses } from './localMockData/addresses'
import { mockOffenderContacts } from './localMockData/offenderContacts'

jest.mock('./tokenStore')

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

  describe('getUserLocations', () => {
    it('should return data from api', async () => {
      mockSuccessfulPrisonApiCall('/api/users/me/locations', LocationDummyDataC)

      const output = await prisonApiClient.getUserLocations()
      expect(output).toEqual(LocationDummyDataC)
    })
  })

  describe('getCaseLoads', () => {
    it('should return data from api', async () => {
      mockSuccessfulPrisonApiCall('/api/users/me/caseLoads?allCaseloads=true', CaseLoadsDummyDataA)

      const output = await prisonApiClient.getUserCaseLoads()
      expect(output).toEqual(CaseLoadsDummyDataA)
    })
  })

  describe('getNonAssociations', () => {
    it.each(['ABC12', 'DEF456'])('Should return data from the API', async prisonerNumber => {
      mockSuccessfulPrisonApiCall(
        `/api/offenders/${prisonerNumber}/non-association-details`,
        nonAssociationDetailsDummyData,
      )

      const output = await prisonApiClient.getNonAssociationDetails(prisonerNumber)
      expect(output).toEqual(nonAssociationDetailsDummyData)
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

  describe('getAdjudications', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      fakePrisonApi
        .get(`/api/bookings/${bookingId}/adjudications`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, adjudicationSummaryMock)

      const output = await prisonApiClient.getAdjudications(bookingId)
      expect(output).toEqual(adjudicationSummaryMock)
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
})
