import { Prisoner } from '../interfaces/prisoner'
import CaseNotesService from './caseNotesService'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'
import { CaseNoteForm } from '../interfaces/caseNotesApi/caseNote'

jest.mock('../data/caseNotesApiClient')

describe('Case Notes Page', () => {
  let prisonerData: Prisoner
  let caseNotesService: CaseNotesService
  let caseNotesApiClientSpy: CaseNotesApiClient

  beforeEach(() => {
    prisonerData = { bookingId: 123456, firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    caseNotesApiClientSpy = {
      getCaseNoteTypes: jest.fn(async () => caseNoteTypesMock),
      getCaseNoteTypesForUser: jest.fn(async () => caseNoteTypesMock),
      getCaseNotes: jest.fn(async () => pagedCaseNotesMock),
      addCaseNote: jest.fn(async () => pagedCaseNotesMock.content[0]),
    }
    caseNotesService = new CaseNotesService(() => caseNotesApiClientSpy)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Case Notes', () => {
    it('should call Case Notes API tp get case notes', async () => {
      const caseNotesPageData = await caseNotesService.get('', prisonerData, {}, true, {
        displayName: 'A Name',
        name: 'Name',
      })

      expect(caseNotesApiClientSpy.getCaseNoteTypes).toHaveBeenCalled()
      expect(caseNotesApiClientSpy.getCaseNotes).toHaveBeenCalledWith(prisonerData.prisonerNumber, {})

      expect(caseNotesPageData.pagedCaseNotes).toEqual(pagedCaseNotesMock)
      expect(caseNotesPageData.fullName).toEqual('John Smith')
    })
  })

  describe('Get Case Note Types for User', () => {
    it('should call Case Notes API tp get case notes types for user', async () => {
      await caseNotesService.getCaseNoteTypesForUser('')

      expect(caseNotesApiClientSpy.getCaseNoteTypesForUser).toHaveBeenCalled()
    })
  })

  describe('Add Case Note', () => {
    it('should call Case Notes API tp add case notes', async () => {
      const prisonerNumber = 'A9999AA'
      const caseNoteForm = {
        type: 'TYPE',
        subType: 'SUBTYPE',
        text: 'Text',
        date: '01/01/2023',
        hours: '12',
        minutes: '30',
      } as CaseNoteForm
      const occurrenceDateTime = '2023-01-01T12:30:00Z'
      await caseNotesService.addCaseNote('', prisonerNumber, caseNoteForm)

      expect(caseNotesApiClientSpy.addCaseNote).toHaveBeenCalledWith(prisonerNumber, {
        type: 'TYPE',
        subType: 'SUBTYPE',
        text: 'Text',
        occurrenceDateTime,
      })
    })
  })
})
