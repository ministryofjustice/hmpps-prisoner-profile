import PagedList, { CaseNotesListQueryParams } from '../prisonApi/PagedList'
import CaseNoteType, { CaseNotesTypeParams } from './CaseNoteType'
import CaseNote from './CaseNote'
import UpdateCaseNoteForm from './UpdateCaseNoteForm'

export default interface CaseNotesApiClient {
  getCaseNotes(
    offenderNumber: string,
    caseloadId: string,
    queryParams: CaseNotesListQueryParams,
  ): Promise<PagedList<CaseNote>>
  getCaseNoteTypes(queryParams: CaseNotesTypeParams): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseloadId: string, caseNote: CaseNote): Promise<CaseNote>
  updateCaseNote(
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    updateCaseNoteForm: UpdateCaseNoteForm,
  ): Promise<CaseNote>
  getCaseNote(prisonerNumber: string, caseloadId: string, caseNoteId: string, ignore404?: boolean): Promise<CaseNote>
}
