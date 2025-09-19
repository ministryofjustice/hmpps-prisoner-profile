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
  getCaseNote(prisonerNumber: string, caseloadId: string, caseNoteId: string, ignore404?: false): Promise<CaseNote>
  getCaseNote(
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    ignore404: boolean,
  ): Promise<CaseNote | null>
  getCaseNoteUsage(
    prisonerNumber: string,
    typeSubTypes: CaseNoteTypeSubTypeRequest[],
    fromDateTime?: string,
    toDateTime?: string,
  ): Promise<CaseNoteUsageSummary>
  getIncentivesCaseNoteCount(
    prisonerNumber: string,
    fromDateTime?: string,
    toDateTime?: string,
  ): Promise<BehaviourCaseNoteCount>
}
