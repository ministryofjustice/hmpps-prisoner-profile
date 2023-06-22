import nock from 'nock'
import config from '../config'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import CaseNotesApiRestClient from './caseNotesApiClient'
import { pagedCaseNotesMock } from './localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from './localMockData/caseNoteTypesMock'
import restClientBuilder from '.'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('caseNotesApiClient', () => {
  let fakeCaseNotesApi: nock.Scope
  let caseNotesApiClient: CaseNotesApiClient

  beforeEach(() => {
    fakeCaseNotesApi = nock(config.apis.caseNotesApi.url)
    caseNotesApiClient = restClientBuilder(
      'Case Notes API',
      config.apis.caseNotesApi,
      CaseNotesApiRestClient,
    )(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulCaseNotesApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeCaseNotesApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCaseNotes', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulCaseNotesApiCall(`/case-notes/${prisonerNumber}?size=20`, pagedCaseNotesMock)

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, null)
      expect(output).toEqual(pagedCaseNotesMock)
    })
  })

  describe('getCaseNoteTypes', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulCaseNotesApiCall(`/case-notes/types`, caseNoteTypesMock)

      const output = await caseNotesApiClient.getCaseNoteTypes()
      expect(output).toEqual(caseNoteTypesMock)
    })
  })
})
