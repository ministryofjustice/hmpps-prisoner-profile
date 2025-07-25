import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import CaseNotesService from './caseNotesService'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'
import CaseNoteForm from '../data/interfaces/caseNotesApi/CaseNoteForm'
import { HmppsUser } from '../interfaces/HmppsUser'
import { findCaseNotesMock } from '../data/localMockData/findCaseNotesMock'
import FindCaseNotesResponse from '../data/interfaces/caseNotesApi/FindCaseNotesResponse'

jest.mock('../data/caseNotesApiClient')

describe('Case Notes Page', () => {
  let prisonerData: Prisoner
  let caseNotesService: CaseNotesService
  let caseNotesApiClientSpy: CaseNotesApiClient

  beforeEach(() => {
    prisonerData = { bookingId: 123456, firstName: 'JOHN', lastName: 'SMITH', prisonId: 'MDI' } as Prisoner
    caseNotesApiClientSpy = {
      getCaseNoteTypes: jest.fn(async () => caseNoteTypesMock),
      getCaseNotes: jest.fn(async () => findCaseNotesMock),
      addCaseNote: jest.fn(async () => findCaseNotesMock.content[0]),
      addCaseNoteAmendment: jest.fn(async () => findCaseNotesMock.content[0]),
      getCaseNote: jest.fn(async () => findCaseNotesMock.content[0]),
    }
    caseNotesService = new CaseNotesService(() => caseNotesApiClientSpy)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Case Notes', () => {
    it('should call Case Notes API to get case notes', async () => {
      const caseNotesPageData = await caseNotesService.get({
        token: '',
        prisonerData,
        currentUserDetails: {
          displayName: 'A Name',
          name: 'Name',
        } as HmppsUser,
      })

      expect(caseNotesPageData.fullName).toEqual('John Smith')
      expect(caseNotesApiClientSpy.getCaseNoteTypes).toHaveBeenCalled()
      expect(caseNotesApiClientSpy.getCaseNotes).toHaveBeenCalledWith(prisonerData.prisonerNumber, {
        includeSensitive: 'false',
      })
    })

    it('should allow inclusion of sensitive case notes', async () => {
      await caseNotesService.get({
        token: '',
        prisonerData,
        currentUserDetails: {
          displayName: 'A Name',
          name: 'Name',
        } as HmppsUser,
        canViewSensitiveCaseNotes: true,
      })

      expect(caseNotesApiClientSpy.getCaseNotes).toHaveBeenCalledWith(prisonerData.prisonerNumber, {
        includeSensitive: 'true',
      })
    })

    it('should correctly calculate pagination metadata', async () => {
      const caseNotesPageData = await caseNotesService.get({
        token: '',
        prisonerData,
        currentUserDetails: {
          displayName: 'A Name',
          name: 'Name',
        } as HmppsUser,
      })

      expect(caseNotesPageData.fullName).toEqual('John Smith')
      expect(caseNotesPageData.pagedCaseNotes).toEqual(
        expect.objectContaining({
          numberOfElements: 20,
          totalElements: 80,
          totalPages: 4,
          empty: false,
          first: true,
          last: false,
          number: 1,
          size: 20,
        }),
      )
      expect(caseNotesApiClientSpy.getCaseNoteTypes).toHaveBeenCalled()
      expect(caseNotesApiClientSpy.getCaseNotes).toHaveBeenCalledWith(prisonerData.prisonerNumber, {
        includeSensitive: 'false',
      })
    })
  })

  describe('Get Case Note Types for HmppsUser', () => {
    it('should call Case Notes API to get case notes types for user', async () => {
      await caseNotesService.getCaseNoteTypesForUser({ token: '' })

      expect(caseNotesApiClientSpy.getCaseNoteTypes).toHaveBeenCalled()
    })
  })

  describe('Add Case Note', () => {
    it('should call Case Notes API tp add case notes', async () => {
      const prisonerNumber = 'A9999AA'
      const updateCaseNoteForm = {
        type: 'TYPE',
        subType: 'SUBTYPE',
        text: 'Text',
        date: '01/01/2023',
        hours: '12',
        minutes: '30',
      } as CaseNoteForm
      const occurrenceDateTime = '2023-01-01T12:30:00'
      await caseNotesService.addCaseNote('', prisonerNumber, 'MDI', updateCaseNoteForm)

      expect(caseNotesApiClientSpy.addCaseNote).toHaveBeenCalledWith(prisonerNumber, prisonerData.prisonId, {
        type: 'TYPE',
        subType: 'SUBTYPE',
        text: 'Text',
        occurrenceDateTime,
      })
    })
  })

  describe('Update Case Note', () => {
    it('should call Case Notes API tp update case notes', async () => {
      const prisonerNumber = 'A9999AA'
      const caseNoteId = 'abc123'
      await caseNotesService.addCaseNoteAmendment('', prisonerNumber, 'MDI', caseNoteId, 'Text')

      expect(caseNotesApiClientSpy.addCaseNoteAmendment).toHaveBeenCalledWith(
        prisonerNumber,
        prisonerData.prisonId,
        'abc123',
        'Text',
      )
    })
  })

  describe('Case note incentive links', () => {
    describe('Given an incentive warning', () => {
      it('Returns an incentive warning link', async () => {
        const foundCaseNotes: FindCaseNotesResponse = { ...findCaseNotesMock }
        foundCaseNotes.content = foundCaseNotes.content.slice(0, 3)
        foundCaseNotes.content[0].subType = 'IEP_WARN'
        foundCaseNotes.content[1].subType = 'IEP_ENC'
        foundCaseNotes.content[2].subType = 'OTHER'
        caseNotesApiClientSpy.getCaseNotes = jest.fn(async () => foundCaseNotes)

        const {
          pagedCaseNotes: { content },
        } = await caseNotesService.get({
          token: '',
          prisonerData,
          currentUserDetails: {
            displayName: 'A Name',
            name: 'Name',
          } as HmppsUser,
        })

        expect(content[0].printIncentiveWarningLink).toBeTruthy()
        expect(content[0].printIncentiveEncouragementLink).toBeFalsy()
        expect(content[1].printIncentiveWarningLink).toBeFalsy()
        expect(content[1].printIncentiveEncouragementLink).toBeTruthy()
        expect(content[2].printIncentiveWarningLink).toBeFalsy()
        expect(content[2].printIncentiveEncouragementLink).toBeFalsy()
      })
    })
  })
})
