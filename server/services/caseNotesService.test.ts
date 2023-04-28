import { Prisoner } from '../interfaces/prisoner'
import CaseNotesService from './caseNotesService'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'

jest.mock('../data/caseNotesApiClient')

describe('Case Notes Page', () => {
  let getCaseNoteTypesSpy: jest.SpyInstance
  let getCaseNotesSpy: jest.SpyInstance
  let prisonerData: Prisoner
  let caseNotesService: CaseNotesService

  beforeEach(() => {
    prisonerData = { bookingId: 123456, firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    caseNotesService = new CaseNotesService(null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Case Notes', () => {
    it('should call Case Notes API tp get case notes', async () => {
      getCaseNoteTypesSpy = jest
        .spyOn<any, string>(caseNotesService['caseNotesApiClient'], 'getCaseNoteTypes')
        .mockResolvedValue(caseNoteTypesMock)
      getCaseNotesSpy = jest
        .spyOn<any, string>(caseNotesService['caseNotesApiClient'], 'getCaseNotes')
        .mockResolvedValue(pagedCaseNotesMock)

      const caseNotesPageData = await caseNotesService.get(prisonerData, {})

      expect(getCaseNoteTypesSpy).toHaveBeenCalled()
      expect(getCaseNotesSpy).toHaveBeenCalledWith(prisonerData.prisonerNumber, {})

      expect(caseNotesPageData.pagedCaseNotes).toEqual(pagedCaseNotesMock)
      expect(caseNotesPageData.fullName).toEqual('John Smith')
    })
  })
})
