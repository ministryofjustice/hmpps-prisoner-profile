import { CaseNotesListQueryParams } from '../prisonApi/PagedList'
import CaseNoteType, { CaseNotesTypeParams } from './CaseNoteType'
import CaseNote from './CaseNote'
import FindCaseNotesResponse from './FindCaseNotesResponse'
import { BehaviourCaseNoteCount, CaseNoteTypeSubTypeRequest, CaseNoteUsageSummary } from './CaseNoteUsage'

export default interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: CaseNotesListQueryParams): Promise<FindCaseNotesResponse>
  getCaseNoteTypes(queryParams: CaseNotesTypeParams): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseloadId: string, caseNote: CaseNote): Promise<CaseNote>
  addCaseNoteAmendment(prisonerNumber: string, caseloadId: string, caseNoteId: string, text: string): Promise<CaseNote>
  getCaseNote(prisonerNumber: string, caseloadId: string, caseNoteId: string, ignore404?: boolean): Promise<CaseNote>
  getCaseNoteUsage(
    prisonerNumber: string,
    typeSubTypes: CaseNoteTypeSubTypeRequest[],
    from?: string,
    to?: string,
  ): Promise<CaseNoteUsageSummary>
  getIncentivesCaseNoteCount(prisonerNumber: string, from?: string, to?: string): Promise<BehaviourCaseNoteCount>
}
