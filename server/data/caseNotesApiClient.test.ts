import nock from 'nock'
import config from '../config'
import CaseNotesApiRestClient from './caseNotesApiClient'
import { pagedCaseNotesMock } from './localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from './localMockData/caseNoteTypesMock'
import CaseNotesApiClient from './interfaces/caseNotesApi/caseNotesApiClient'
import CaseNote from './interfaces/caseNotesApi/CaseNote'

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
  const mockSuccessfulCaseNotesPutApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeCaseNotesApi.put(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCaseNotes', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulCaseNotesApiCall(`/case-notes/${prisonerNumber}?size=20`, pagedCaseNotesMock)

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, 'MDI', null)
      expect(output).toEqual(pagedCaseNotesMock)
    })

    it.each(['true', 'false'])('Should map include sensitive query param (%s)', async includeSensitive => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulCaseNotesApiCall(
        `/case-notes/${prisonerNumber}?size=20&includeSensitive=${includeSensitive}`,
        pagedCaseNotesMock,
      )

      const output = await caseNotesApiClient.getCaseNotes(prisonerNumber, 'MDI', {
        includeSensitive,
      })

      expect(output).toEqual(pagedCaseNotesMock)
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
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulCaseNotesPostApiCall(`/case-notes/${prisonerNumber}`, pagedCaseNotesMock.content[0])

      const output = await caseNotesApiClient.addCaseNote(prisonerNumber, 'MDI', {} as CaseNote)
      expect(output).toEqual(pagedCaseNotesMock.content[0])
    })
  })

  describe('updateCaseNote', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulCaseNotesPutApiCall(`/case-notes/${prisonerNumber}/abc123`, pagedCaseNotesMock.content[0])

      const output = await caseNotesApiClient.addCaseNoteAmendment(prisonerNumber, 'MDI', 'abc123', 'text')
      expect(output).toEqual(pagedCaseNotesMock.content[0])
    })
  })
})
