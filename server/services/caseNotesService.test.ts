import { Prisoner } from '../interfaces/prisoner'
import CaseNotesService from './caseNotesService'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'

jest.mock('../data/caseNotesApiClient')

describe('Case Notes Page', () => {
  let prisonerData: Prisoner
  let caseNotesService: CaseNotesService
  let caseNotesApiClientSpy: CaseNotesApiClient

  beforeEach(() => {
    prisonerData = { bookingId: 123456, firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    caseNotesApiClientSpy = {
      getCaseNoteTypes: jest.fn(async () => caseNoteTypesMock),
      getCaseNotes: jest.fn(async () => pagedCaseNotesMock),
    }
    caseNotesService = new CaseNotesService(() => caseNotesApiClientSpy)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Case Notes', () => {
    it('should call Case Notes API tp get case notes', async () => {
      const caseNotesPageData = await caseNotesService.get('', prisonerData, {}, true)

      expect(caseNotesApiClientSpy.getCaseNoteTypes).toHaveBeenCalled()
      expect(caseNotesApiClientSpy.getCaseNotes).toHaveBeenCalledWith(prisonerData.prisonerNumber, {})

      expect(caseNotesPageData.pagedCaseNotes).toEqual(pagedCaseNotesMock)
      expect(caseNotesPageData.fullName).toEqual('John Smith')
    })
  })
})
