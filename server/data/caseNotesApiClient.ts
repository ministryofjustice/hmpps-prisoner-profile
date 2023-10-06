import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import { CaseNoteType } from '../interfaces/caseNoteType'
import { CaseNote } from '../interfaces/caseNotesApi/caseNote'

export default class CaseNotesApiRestClient implements CaseNotesApiClient {
  constructor(private readonly restClient: RestClient) {}

  private async get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  private async post(args: object): Promise<unknown> {
    return this.restClient.post(args)
  }

  async getCaseNotes(offenderNumber: string, queryParams?: PagedListQueryParams): Promise<PagedList<CaseNote>> {
    // Set defaults then apply queryParams
    const params: PagedListQueryParams = {
      size: queryParams?.showAll ? 9999 : 20,
      ...queryParams,
    }
    return this.get<PagedList<CaseNote>>({ path: `/case-notes/${offenderNumber}`, query: mapToQueryString(params) })
  }

  async getCaseNoteTypes(): Promise<CaseNoteType[]> {
    return this.get<CaseNoteType[]>({ path: `/case-notes/types` })
  }

  async getCaseNoteTypesForUser(): Promise<CaseNoteType[]> {
    return this.get<CaseNoteType[]>({ path: `/case-notes/types-for-user` })
  }

  async addCaseNote(prisonerNumber: string, caseNote: CaseNote): Promise<CaseNote> {
    return (await this.post({ path: `/case-notes/${prisonerNumber}`, data: caseNote })) as Promise<CaseNote>
  }
}
