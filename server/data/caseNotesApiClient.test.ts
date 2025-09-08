import nock, { RequestBodyMatcher } from 'nock'
import config from '../config'
import CaseNotesApiRestClient from './caseNotesApiClient'
import { caseNoteTypesMock } from './localMockData/caseNoteTypesMock'
import CaseNotesApiClient from './interfaces/caseNotesApi/caseNotesApiClient'
import CaseNote from './interfaces/caseNotesApi/CaseNote'
import { findCaseNotesMock } from './localMockData/findCaseNotesMock'
import { caseNoteUsageMock, caseNoteUsageMockWithNoResults } from './localMockData/caseNoteUsageMock'
import { CaseNoteSubType, CaseNoteType } from './enums/caseNoteType'
import { BehaviourCaseNoteCount } from './interfaces/caseNotesApi/CaseNoteUsage'

const token = { access_token: 'token-1', expires_in: 300 }
const prisonerNumber = 'AB1234Y'

describe('caseNotesApiClient', () => {
  let fakeCaseNotesApi: nock.Scope
  let caseNotesApiClient: CaseNotesApiClient

  beforeEach(() => {
    fakeCaseNotesApi = nock(config.apis.caseNotesApi.url)
    caseNotesApiClient = new CaseNotesApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulCaseNotesApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeCaseNotesApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }
  const mockSuccessfulCaseNotesPostApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeCaseNotesApi.post(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }
  const mockSuccessfulCaseNotesPostApiCallWithExpectedBody = <TReturnData>(
    url: string,
    expectedBody: RequestBodyMatcher,
    returnData: TReturnData,
  ) => {
    fakeCaseNotesApi
      .post(url, expectedBody)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }
  const mockSuccessfulCaseNotesPutApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeCaseNotesApi.put(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCaseNotes', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulCaseNotesPostApiCall(`/search/case-notes/${prisonerNumber}`, findCaseNotesMock)

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, null)
      expect(output).toEqual(findCaseNotesMock)
    })

    it('Should send a request with sensible default values', async () => {
      const expectedRequest = {
        includeSensitive: false,
        page: 1,
        size: 20,
      }
      mockSuccessfulCaseNotesPostApiCallWithExpectedBody(
        `/search/case-notes/${prisonerNumber}`,
        expectedRequest,
        findCaseNotesMock,
      )

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, null)
      expect(output).toEqual(findCaseNotesMock)
    })

    it('Should correctly map query parameters to request', async () => {
      const queryParams = {
        type: 'TYPE',
        subType: 'SUBTYPE',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        includeSensitive: 'true',
        page: 2,
        size: 17,
        sort: 'createdAt,DESC',
      }
      const expectedRequest = {
        includeSensitive: true,
        typeSubTypes: [
          {
            type: 'TYPE',
            subTypes: ['SUBTYPE'],
          },
        ],
        occurredFrom: '2024-01-01',
        occurredTo: '2025-01-01',
        page: 2,
        size: 17,
        sort: 'createdAt,DESC',
      }
      mockSuccessfulCaseNotesPostApiCallWithExpectedBody(
        `/search/case-notes/${prisonerNumber}`,
        expectedRequest,
        findCaseNotesMock,
      )

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, queryParams)
      expect(output).toEqual(findCaseNotesMock)
    })

    it('Should support the showAll query parameter', async () => {
      const queryParams = { showAll: true }
      const expectedRequest = {
        includeSensitive: false,
        page: 1,
        size: 9999,
      }
      mockSuccessfulCaseNotesPostApiCallWithExpectedBody(
        `/search/case-notes/${prisonerNumber}`,
        expectedRequest,
        findCaseNotesMock,
      )

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, queryParams)
      expect(output).toEqual(findCaseNotesMock)
    })
  })

  describe('getCaseNoteTypes', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulCaseNotesApiCall(`/case-notes/types?selectableBy=ALL&includeInactive=true`, caseNoteTypesMock)

      const output = await caseNotesApiClient.getCaseNoteTypes({ includeInactive: true })
      expect(output).toEqual(caseNoteTypesMock)
    })
  })

  describe('addCaseNote', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulCaseNotesPostApiCall(`/case-notes/${prisonerNumber}`, findCaseNotesMock.content[0])

      const output = await caseNotesApiClient.addCaseNote(prisonerNumber, 'MDI', {} as CaseNote)
      expect(output).toEqual(findCaseNotesMock.content[0])
    })
  })

  describe('updateCaseNote', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulCaseNotesPutApiCall(`/case-notes/${prisonerNumber}/A1234BC`, findCaseNotesMock.content[0])

      const output = await caseNotesApiClient.addCaseNoteAmendment(prisonerNumber, 'MDI', 'A1234BC', 'text')
      expect(output).toEqual(findCaseNotesMock.content[0])
    })
  })

  describe('getCaseNoteUsage', () => {
    it('Should return data from the API', async () => {
      const typeSubTypes = [
        {
          type: 'TYPE_ONE',
          subTypes: ['SUB_ONE'],
        },
        {
          type: 'TYPE_TWO',
          subTypes: ['SUB_TWO', 'SUB_THREE'],
        },
      ]
      const expectedRequest: RequestBodyMatcher = {
        personIdentifiers: [prisonerNumber],
        typeSubTypes,
      }
      mockSuccessfulCaseNotesPostApiCallWithExpectedBody(`/case-notes/usage`, expectedRequest, caseNoteUsageMock)

      const output = await caseNotesApiClient.getCaseNoteUsage(prisonerNumber, typeSubTypes)
      expect(output).toEqual(caseNoteUsageMock)
    })
  })

  describe('getIncentivesCaseNoteCount', () => {
    const incentivesPrisonerNumber = 'G6123VU'

    it('Should return data from the API', async () => {
      const typeSubTypes = [
        {
          type: CaseNoteType.PositiveBehaviour,
          subTypes: [CaseNoteSubType.IncentiveEncouragement],
        },
        {
          type: CaseNoteType.NegativeBehaviour,
          subTypes: [CaseNoteSubType.IncentiveWarning],
        },
      ]
      const expectedRequest: RequestBodyMatcher = {
        personIdentifiers: [incentivesPrisonerNumber],
        typeSubTypes,
      }
      mockSuccessfulCaseNotesPostApiCallWithExpectedBody(`/case-notes/usage`, expectedRequest, caseNoteUsageMock)

      const expected: BehaviourCaseNoteCount = {
        positiveBehaviourCount: 2,
        negativeBehaviourCount: 1,
      }
      const output = await caseNotesApiClient.getIncentivesCaseNoteCount(incentivesPrisonerNumber)
      expect(output).toEqual(expected)
    })

    it('Should handle no results in response', async () => {
      mockSuccessfulCaseNotesPostApiCall(`/case-notes/usage`, caseNoteUsageMockWithNoResults)
      const expected = {
        positiveBehaviourCount: 0,
        negativeBehaviourCount: 0,
      }

      const output = await caseNotesApiClient.getIncentivesCaseNoteCount(
        incentivesPrisonerNumber,
        CaseNoteType.PositiveBehaviour,
      )
      expect(output).toEqual(expected)
    })
  })
})
