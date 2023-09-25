import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import { CaseNoteType } from '../interfaces/caseNoteType'
import { CaseNote } from '../interfaces/caseNotesApi/caseNote'
import config from '../config'

export default class CaseNotesApiRestClient implements CaseNotesApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Case Notes API', config.apis.caseNotesApi, token)
  }

  private async get<T>(args: object): Promise<T> {
    try {
      return await this.restClient.get<T>(args)
    } catch (error) {
      return error
    }
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

  async getCaseNote(prisonerNumber: string, caseNoteId: string): Promise<CaseNote> {
    return this.get<CaseNote>({ path: `/case-notes/${prisonerNumber}/${caseNoteId}` })
  }

}
