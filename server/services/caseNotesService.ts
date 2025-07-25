import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { convertNameCommaToHuman, formatName, generateListMetadata } from '../utils/utils'
import { SortOption } from '../interfaces/SortParams'
import { formatDateTimeISO, parseDate } from '../utils/dateHelpers'
import HmppsError from '../interfaces/HmppsError'

import CaseNotesPageData, { CaseNotePageData } from './interfaces/caseNotesService/CaseNotesPageData'
import { CaseNoteSource } from '../data/enums/caseNoteSource'
import config from '../config'
import { RestClientBuilder } from '../data'
import validateDateRange from '../utils/validateDateRange'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'
import CaseNote, { CaseNoteAmendment } from '../data/interfaces/caseNotesApi/CaseNote'
import CaseNoteForm from '../data/interfaces/caseNotesApi/CaseNoteForm'
import PagedList, { CaseNotesListQueryParams, PagedListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { HmppsUser } from '../interfaces/HmppsUser'

export default class CaseNotesService {
  constructor(private readonly caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>) {}

  /**
   * Map query params from the browser to values suitable for sending to the API.
   *
   * @param queryParams
   * @private
   */
  private mapToApiParams(queryParams: CaseNotesListQueryParams) {
    const apiParams = { ...queryParams }

    if (apiParams.startDate)
      apiParams.startDate =
        apiParams.startDate && formatDateTimeISO(parseDate(apiParams.startDate), { startOfDay: true })
    if (apiParams.endDate)
      apiParams.endDate = apiParams.endDate && formatDateTimeISO(parseDate(apiParams.endDate), { endOfDay: true })

    return apiParams
  }

  public async get({
    token,
    prisonerData,
    queryParams = {},
    canViewSensitiveCaseNotes = false,
    canDeleteSensitiveCaseNotes = false,
    currentUserDetails,
  }: {
    token: string
    prisonerData: Prisoner
    queryParams?: CaseNotesListQueryParams
    canViewSensitiveCaseNotes?: boolean
    canDeleteSensitiveCaseNotes?: boolean
    currentUserDetails: HmppsUser
  }): Promise<CaseNotesPageData> {
    const sortOptions: SortOption[] = [
      { value: 'createdAt,DESC', description: 'Created (most recent)' },
      { value: 'createdAt,ASC', description: 'Created (oldest)' },
      { value: 'occurredAt,DESC', description: 'Happened (most recent)' },
      { value: 'occurredAt,ASC', description: 'Happened (oldest)' },
    ]

    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    const errors: HmppsError[] = validateDateRange(queryParams.startDate, queryParams.endDate)

    let pagedCaseNotes: PagedList<CaseNotePageData>
    let hasCaseNotes: boolean
    const caseNoteTypes = await caseNotesApiClient.getCaseNoteTypes({
      dpsUserSelectableOnly: false,
      includeInactive: true,
      includeRestricted: true,
    })
    const prisonerFullName = formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName)

    if (!errors.length) {
      const {
        content,
        metadata,
        hasCaseNotes: hasNotes,
      } = await caseNotesApiClient.getCaseNotes(prisonerData.prisonerNumber, {
        ...this.mapToApiParams(queryParams),
        includeSensitive: String(canViewSensitiveCaseNotes),
      })

      const pagedCaseNotesContent = content?.map((caseNote: CaseNote) => {
        return {
          ...caseNote,
          authorName: convertNameCommaToHuman(caseNote.authorName),
          amendments: caseNote.amendments?.map((amendment: CaseNoteAmendment) => ({
            ...amendment,
            authorName: convertNameCommaToHuman(amendment.authorName),
          })),
          addMoreLinkUrl: `/prisoner/${prisonerData.prisonerNumber}/update-case-note/${caseNote.caseNoteId}`,
          deleteLinkUrl:
            caseNote.source === CaseNoteSource.SecureCaseNoteSource &&
            canDeleteSensitiveCaseNotes &&
            `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/case-notes/delete-case-note/${caseNote.caseNoteId}`,
          printIncentiveWarningLink:
            caseNote.subType === 'IEP_WARN' &&
            `${config.serviceUrls.digitalPrison}/iep-slip?offenderNo=${
              prisonerData.prisonerNumber
            }&offenderName=${encodeURIComponent(prisonerFullName)}&location=${encodeURIComponent(
              prisonerData.cellLocation,
            )}&casenoteId=${caseNote.caseNoteId}&issuedBy=${encodeURIComponent(currentUserDetails.displayName)}`,
          printIncentiveEncouragementLink:
            caseNote.subType === 'IEP_ENC' &&
            `${config.serviceUrls.digitalPrison}/iep-slip?offenderNo=${
              prisonerData.prisonerNumber
            }&offenderName=${encodeURIComponent(prisonerFullName)}&location=${encodeURIComponent(
              prisonerData.cellLocation,
            )}&casenoteId=${caseNote.caseNoteId}&issuedBy=${encodeURIComponent(currentUserDetails.displayName)}`,
        }
      })

      pagedCaseNotes = this.mapMetadata(pagedCaseNotesContent, metadata, queryParams)
      hasCaseNotes = hasNotes
    }

    return {
      pagedCaseNotes,
      listMetadata: generateListMetadata(
        pagedCaseNotes,
        { ...queryParams, page: undefined }, // Remove page param before generating metadata as this value come from API
        'case note',
        sortOptions,
        'Sort by',
        true,
      ),
      hasCaseNotes,
      caseNoteTypes,
      fullName: prisonerFullName,
      errors,
    }
  }

  public async getCaseNoteTypesForUser({
    token,
    canEditSensitiveCaseNotes,
  }: {
    token: string
    canEditSensitiveCaseNotes?: boolean
  }) {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    return caseNotesApiClient.getCaseNoteTypes({
      dpsUserSelectableOnly: true,
      includeInactive: false,
      includeRestricted: canEditSensitiveCaseNotes,
    })
  }

  public async getCaseNote(
    token: string,
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
  ): Promise<CaseNote> {
    return this.caseNotesApiClientBuilder(token).getCaseNote(prisonerNumber, caseloadId, caseNoteId)
  }

  public async addCaseNote(token: string, prisonerNumber: string, caseloadId: string, caseNote: CaseNoteForm) {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    const dateTime = parseDate(caseNote.date).setHours(+caseNote.hours, +caseNote.minutes, 0)
    const occurrenceDateTime = formatDateTimeISO(new Date(dateTime))

    return caseNotesApiClient.addCaseNote(prisonerNumber, caseloadId, {
      type: caseNote.type,
      subType: caseNote.subType,
      text: caseNote.text,
      occurrenceDateTime,
    })
  }

  public async addCaseNoteAmendment(
    token: string,
    prisonerNumber: string,
    caseloadId: string,
    caseNoteId: string,
    text: string,
  ) {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)

    return caseNotesApiClient.addCaseNoteAmendment(prisonerNumber, caseloadId, caseNoteId, text)
  }

  private mapMetadata<T>(
    content: T[],
    metadata: { totalElements: number; page: number; size: number },
    queryParams: PagedListQueryParams,
  ): PagedList<T> {
    const totalElements = metadata?.totalElements ?? 0
    const page = metadata?.page ?? 1
    const pageSize = metadata?.size ?? 1
    const totalPages = Math.floor(totalElements / pageSize) + Math.min(totalElements % pageSize, 1)
    const sorted = !!queryParams?.sort
    const sort = { empty: false, sorted, unsorted: !sorted }

    return {
      content,
      empty: totalElements === 0,
      first: metadata?.page === 1,
      last: page === totalPages,
      number: page,
      numberOfElements: content?.length ?? 0,
      size: pageSize,
      sort,
      totalElements,
      totalPages,
      pageable: {
        sort,
        offset: (page - 1) * pageSize,
        pageSize,
        pageNumber: page - 1, // This API uses a 1-indexed page number, but the common pagination component uses 0-indexed
        paged: true,
        unpaged: false,
      },
    }
  }
}
