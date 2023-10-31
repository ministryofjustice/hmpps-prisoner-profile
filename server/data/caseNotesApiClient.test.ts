import nock from 'nock'
import config from '../config'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import CaseNotesApiRestClient from './caseNotesApiClient'
import { pagedCaseNotesMock } from './localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from './localMockData/caseNoteTypesMock'
import { CaseNote } from '../interfaces/caseNotesApi/caseNote'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

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

  describe('getCaseNoteTypesForUser', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulCaseNotesApiCall(`/case-notes/types-for-user`, caseNoteTypesMock)

      const output = await caseNotesApiClient.getCaseNoteTypesForUser()
      expect(output).toEqual(caseNoteTypesMock)
    })
  })

  describe('addCaseNote', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulCaseNotesPostApiCall(`/case-notes/${prisonerNumber}`, pagedCaseNotesMock.content[0])

      const output = await caseNotesApiClient.addCaseNote(prisonerNumber, {} as CaseNote)
      expect(output).toEqual(pagedCaseNotesMock.content[0])
    })
  })
})
