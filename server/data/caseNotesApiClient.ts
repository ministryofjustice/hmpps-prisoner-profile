import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'

import config from '../config'
import CaseNotesApiClient from './interfaces/caseNotesApi/caseNotesApiClient'
import PagedList, { CaseNotesListQueryParams } from './interfaces/prisonApi/PagedList'
import CaseNote from './interfaces/caseNotesApi/CaseNote'
import CaseNoteType, { CaseNotesTypeParams, CaseNotesTypeQueryParams } from './interfaces/caseNotesApi/CaseNoteType'

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

  async getCaseNotes(
    offenderNumber: string,
    caseloadId: string,
    queryParams?: CaseNotesListQueryParams,
  ): Promise<PagedList<CaseNote>> {
    // Set defaults then apply queryParams
    const params: CaseNotesListQueryParams = {
      size: queryParams?.showAll ? 9999 : 20,
      ...queryParams,
    }
    return this.get<PagedList<CaseNote>>({
      path: `/case-notes/${offenderNumber}`,
      query: mapToQueryString(params),
      headers: { caseloadId },
    })
  }

  async getCaseNoteTypes(queryParams: CaseNotesTypeParams): Promise<CaseNoteType[]> {
    const params: CaseNotesTypeQueryParams = {
      selectableBy: queryParams.dpsUserSelectableOnly ? 'DPS_USER' : 'ALL',
      includeInactive: queryParams.includeInactive,
      includeRestricted: queryParams.includeRestricted,
    }
    return this.get<CaseNoteType[]>({ path: `/case-notes/types`, query: mapToQueryString(params) })
  }

  async addCaseNote(prisonerNumber: string, caseloadId: string, caseNote: CaseNote): Promise<CaseNote> {
    return (await this.post({
      path: `/case-notes/${prisonerNumber}`,
      data: {
        ...caseNote,
        locationId: caseloadId,
      },
      headers: { caseloadId },
    })) as Promise<CaseNote>
  }

  async addCaseNoteAmendment(
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    text: string,
  ): Promise<CaseNote> {
    return (await this.put({
      path: `/case-notes/${prisonerNumber}/${caseNoteId}`,
      data: { text },
      headers: { caseloadId },
    })) as Promise<CaseNote>
  }

  async getCaseNote(
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    ignore404 = false,
  ): Promise<CaseNote> {
    return this.get<CaseNote>({
      path: `/case-notes/${prisonerNumber}/${caseNoteId}`,
      headers: { caseloadId },
      ignore404,
    })
  }
}
