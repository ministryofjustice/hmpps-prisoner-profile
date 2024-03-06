import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import { PagedList, CaseNotesListQueryParams } from '../interfaces/prisonApi/pagedList'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import { CaseNoteType } from '../interfaces/caseNoteType'
import { CaseNote, UpdateCaseNoteForm } from '../interfaces/caseNotesApi/caseNote'
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

  private async put(args: object): Promise<unknown> {
    return this.restClient.put(args)
  }

  async getCaseNotes(offenderNumber: string, queryParams?: CaseNotesListQueryParams): Promise<PagedList<CaseNote>> {
    // Set defaults then apply queryParams
    const params: CaseNotesListQueryParams = {
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

  async updateCaseNote(
    prisonerNumber: string,
    caseNoteId: string,
    updateCaseNoteForm: UpdateCaseNoteForm,
  ): Promise<CaseNote> {
    return (await this.put({
      path: `/case-notes/${prisonerNumber}/${caseNoteId}`,
      data: { text: updateCaseNoteForm.text },
    })) as Promise<CaseNote>
  }

  async getCaseNote(prisonerNumber: string, caseNoteId: string, ignore404 = false): Promise<CaseNote> {
    return this.get<CaseNote>({ path: `/case-notes/${prisonerNumber}/${caseNoteId}`, ignore404 })
  }
}
