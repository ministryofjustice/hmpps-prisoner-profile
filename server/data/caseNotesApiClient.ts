import config from '../config'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import { PagedListQueryParams, PagedList } from '../interfaces/prisonApi/pagedList'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import { CaseNoteType } from '../interfaces/caseNoteType'

export default class CaseNotesApiRestClient implements CaseNotesApiClient {
  constructor(private readonly restClient: RestClient) {}

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
      size: queryParams?.showAll ? 9999 : 20,
      ...queryParams,
    }
    return this.get<PagedList>({ path: `/case-notes/${offenderNumber}`, query: mapToQueryString(params) })
  }

  async getCaseNoteTypes(): Promise<CaseNoteType[]> {
    return this.get<CaseNoteType[]>({ path: `/case-notes/types` })
  }
}
