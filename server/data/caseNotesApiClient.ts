import config from '../config'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import { PagedListQueryParams, PagedList } from '../interfaces/prisonApi/pagedList'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import { CaseNoteReferenceCode } from '../interfaces/caseNotesApi/CaseNoteReferenceCode'

export default class CaseNotesApiRestClient implements CaseNotesApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Case Notes API', config.apis.caseNotesApi, token)
  }

  private async get<T>(args: object, localMockData?: T): Promise<T> {
    try {
      return await this.restClient.get<T>(args)
    } catch (error) {
      if (config.localMockData === 'true' && localMockData) {
        return localMockData
      }
      return error
    }
  }

  async getCaseNotes(offenderNumber: string, queryParams?: PagedListQueryParams): Promise<PagedList> {
    // Set defaults then apply queryParams
    const params: PagedListQueryParams = {
      size: 20,
      ...queryParams,
    }
    return this.get<PagedList>({ path: `/case-notes/${offenderNumber}`, query: mapToQueryString(params) })
  }

  async getCaseNoteTypes(): Promise<CaseNoteReferenceCode[]> {
    return this.get<CaseNoteReferenceCode[]>({ path: `/case-notes/types` })
  }
}
