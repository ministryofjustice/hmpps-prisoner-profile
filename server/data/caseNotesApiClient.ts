import RestClient from './restClient'
import { arrayToQueryString, mapToQueryString } from '../utils/utils'

import config from '../config'
import CaseNotesApiClient from './interfaces/caseNotesApi/caseNotesApiClient'
import PagedList, { CaseNotesListQueryParams } from './interfaces/prisonApi/PagedList'
import CaseNote from './interfaces/caseNotesApi/CaseNote'
import CaseNoteType, { CaseNotesTypeParams, CaseNotesTypeQueryParams } from './interfaces/caseNotesApi/CaseNoteType'
import UpdateCaseNoteForm from './interfaces/caseNotesApi/UpdateCaseNoteForm'
import { QueryParams } from '../interfaces/QueryParams'

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

  mapCaseNoteTypesQueryString(params: QueryParams) {
    if (!params) return ''
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => {
        if (Array.isArray(params[key])) {
          // Case Note Type endpoint requires include= when the array for "include" is empty
          if (params[key].length === 0) {
            return `${key}=`
          }
          return arrayToQueryString(params[key], key)
        }
        return `${key}=${encodeURIComponent(params[key])}`
      })
      .join('&')
  }

  async getCaseNotes(offenderNumber: string, queryParams?: CaseNotesListQueryParams): Promise<PagedList<CaseNote>> {
    // Set defaults then apply queryParams
    const params: CaseNotesListQueryParams = {
      size: queryParams?.showAll ? 9999 : 20,
      ...queryParams,
    }
    return this.get<PagedList<CaseNote>>({ path: `/case-notes/${offenderNumber}`, query: mapToQueryString(params) })
  }

  async getCaseNoteTypes(queryParams: CaseNotesTypeParams): Promise<CaseNoteType[]> {
    const params: CaseNotesTypeQueryParams = {
      selectableBy: queryParams.dpsUserSelectableOnly ? 'DPS_USER' : 'ALL',
      include: [
        ...(queryParams.includeSensitive ? ['SENSITIVE'] : []),
        ...(queryParams.includeRestrictedUse ? ['RESTRICTED'] : []),
        ...(queryParams.includeInactive ? ['INACTIVE'] : []),
      ] as ('SENSITIVE' | 'RESTRICTED' | 'INACTIVE')[],
    }
    return this.get<CaseNoteType[]>({ path: `/case-notes/types`, query: this.mapCaseNoteTypesQueryString(params) })
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
