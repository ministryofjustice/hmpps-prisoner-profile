import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import config from '../config'
import CaseNotesApiClient from './interfaces/caseNotesApi/caseNotesApiClient'
import { CaseNotesListQueryParams } from './interfaces/prisonApi/PagedList'
import CaseNote from './interfaces/caseNotesApi/CaseNote'
import CaseNoteType, { CaseNotesTypeParams, CaseNotesTypeQueryParams } from './interfaces/caseNotesApi/CaseNoteType'
import FindCaseNotesResponse from './interfaces/caseNotesApi/FindCaseNotesResponse'

export default class CaseNotesApiRestClient extends RestClient implements CaseNotesApiClient {
  constructor(token: string) {
    super('Case Notes API', config.apis.caseNotesApi, token)
  }

  async getCaseNotes(prisonerNumber: string, queryParams?: CaseNotesListQueryParams): Promise<FindCaseNotesResponse> {
    const request = {
      occurredFrom: queryParams?.startDate,
      occurredTo: queryParams?.endDate,
      includeSensitive: queryParams?.includeSensitive === 'true',
      typeSubTypes: this.mapTypeAndSubType(queryParams?.type, queryParams?.subType),
      page: queryParams?.page ?? 1,
      size: queryParams?.showAll ? 9999 : (queryParams?.size ?? 20),
      sort: queryParams?.sort,
    }
    return this.post<FindCaseNotesResponse>(
      {
        path: `/search/case-notes/${prisonerNumber}`,
        data: request,
      },
      this.token,
    )
  }

  async getCaseNoteTypes(queryParams: CaseNotesTypeParams): Promise<CaseNoteType[]> {
    const params: CaseNotesTypeQueryParams = {
      selectableBy: queryParams.dpsUserSelectableOnly ? 'DPS_USER' : 'ALL',
      includeInactive: queryParams.includeInactive,
      includeRestricted: queryParams.includeRestricted,
    }
    return this.get<CaseNoteType[]>({ path: `/case-notes/types`, query: mapToQueryString(params) }, this.token)
  }

  async addCaseNote(prisonerNumber: string, caseloadId: string, caseNote: CaseNote): Promise<CaseNote> {
    return this.post<CaseNote>(
      {
        path: `/case-notes/${prisonerNumber}`,
        data: {
          ...caseNote,
          locationId: caseloadId,
        },
        headers: { caseloadId },
      },
      this.token,
    )
  }

  async addCaseNoteAmendment(
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    text: string,
  ): Promise<CaseNote> {
    return this.put<CaseNote>(
      {
        path: `/case-notes/${prisonerNumber}/${caseNoteId}`,
        data: { text },
        headers: { caseloadId },
      },
      this.token,
    )
  }

  async getCaseNote(
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    ignore404 = false,
  ): Promise<CaseNote> {
    if (ignore404) {
      return this.getAndIgnore404<CaseNote>({
        path: `/case-notes/${prisonerNumber}/${caseNoteId}`,
        headers: { caseloadId },
      })
    }

    return this.get<CaseNote>(
      {
        path: `/case-notes/${prisonerNumber}/${caseNoteId}`,
        headers: { caseloadId },
      },
      this.token,
    )
  }

  private mapTypeAndSubType(type?: string, subtype?: string): { type: string; subTypes: string[] }[] | undefined {
    if (!type) {
      return undefined
    }

    return [
      {
        type,
        subTypes: subtype ? [subtype] : [],
      },
    ]
  }
}
