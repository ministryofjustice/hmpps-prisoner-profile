import { Prisoner } from '../interfaces/prisoner'
import { convertNameCommaToHuman, formatName, generateListMetadata } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { SortOption } from '../interfaces/sortSelector'
import { formatDateTimeISO, parseDate } from '../utils/dateHelpers'
import { HmppsError } from '../interfaces/hmppsError'
import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'
import { CaseNotePageData, CaseNotesPageData } from '../interfaces/pages/caseNotesPageData'
import { CaseNote, CaseNoteAmendment, CaseNoteForm } from '../interfaces/caseNotesApi/caseNote'
import { CaseNoteSource } from '../data/enums/caseNoteSource'
import config from '../config'
import { RestClientBuilder } from '../data'
import { UserDetails } from './userService'
import validateDateRange from '../utils/validateDateRange'

export default class CaseNotesService {
  constructor(private readonly caseNotesApiClientBuilder: RestClientBuilder<CaseNotesApiClient>) {}

  /**
   * Map query params from the browser to values suitable for sending to the API.
   *
   * @param queryParams
   * @private
   */
  private mapToApiParams(queryParams: PagedListQueryParams) {
    const apiParams = { ...queryParams }

    if (apiParams.startDate)
      apiParams.startDate =
        apiParams.startDate && formatDateTimeISO(parseDate(apiParams.startDate), { startOfDay: true })
    if (apiParams.endDate)
      apiParams.endDate = apiParams.endDate && formatDateTimeISO(parseDate(apiParams.endDate), { endOfDay: true })
    if (apiParams.page) apiParams.page = apiParams.page && +apiParams.page - 1 // Change page to zero based for API query

    return apiParams
  }

  /**
   * Handle request for case notes
   *
   * @param token
   * @param prisonerData
   * @param queryParams
   * @param canDeleteSensitiveCaseNotes
   */
  public async get(
    token: string,
    prisonerData: Prisoner,
    queryParams: PagedListQueryParams,
    canDeleteSensitiveCaseNotes: boolean,
    currentUserDetails: UserDetails,
  ): Promise<CaseNotesPageData> {
    const sortOptions: SortOption[] = [
      { value: 'creationDateTime,DESC', description: 'Created (most recent)' },
      { value: 'creationDateTime,ASC', description: 'Created (oldest)' },
      { value: 'occurrenceDateTime,DESC', description: 'Happened (most recent)' },
      { value: 'occurrenceDateTime,ASC', description: 'Happened (oldest)' },
    ]

    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    const errors: HmppsError[] = validateDateRange(queryParams.startDate, queryParams.endDate)

    let pagedCaseNotes: PagedList<CaseNotePageData>
    const caseNoteTypes = await caseNotesApiClient.getCaseNoteTypes()
    const prisonerFullName = formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName)

    if (!errors.length) {
      const { content, ...rest } = await caseNotesApiClient.getCaseNotes(
        prisonerData.prisonerNumber,
        this.mapToApiParams(queryParams),
      )

      const pagedCaseNotesContent = content?.map((caseNote: CaseNote) => {
        return {
          ...caseNote,
          authorName: convertNameCommaToHuman(caseNote.authorName),
          amendments: caseNote.amendments?.map((amendment: CaseNoteAmendment) => ({
            ...amendment,
            authorName: convertNameCommaToHuman(amendment.authorName),
          })),
          addMoreLinkUrl: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/case-notes/amend-case-note/${caseNote.caseNoteId}`,
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

      pagedCaseNotes = { ...rest, content: pagedCaseNotesContent }
    }

    return {
      pagedCaseNotes,
      listMetadata: generateListMetadata(
        pagedCaseNotes,
        { ...queryParams, page: undefined }, // Remove page param before generating metadata as this value come from API
        'case note',
        sortOptions,
        'Sort by',
      ),
      caseNoteTypes,
      fullName: prisonerFullName,
      errors,
    }
  }

  public async getCaseNoteTypesForUser(token: string) {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    return caseNotesApiClient.getCaseNoteTypesForUser()
  }

  public async addCaseNote(token: string, prisonerNumber: string, caseNote: CaseNoteForm) {
    const caseNotesApiClient = this.caseNotesApiClientBuilder(token)
    const dateTime = parseDate(caseNote.date).setHours(+caseNote.hours, +caseNote.minutes, 0)
    const occurrenceDateTime = formatDateTimeISO(new Date(dateTime))

    return caseNotesApiClient.addCaseNote(prisonerNumber, {
      type: caseNote.type,
      subType: caseNote.subType,
      text: caseNote.text,
      occurrenceDateTime,
    })
  }
}
