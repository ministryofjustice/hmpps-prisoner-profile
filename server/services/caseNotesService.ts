import { isBefore, isFuture } from 'date-fns'
import { Prisoner } from '../interfaces/prisoner'
import { convertNameCommaToHuman, formatName, generateListMetadata } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { SortOption } from '../interfaces/sortSelector'
import { formatDateTimeISO, isRealDate, parseDate } from '../utils/dateHelpers'
import { HmppsError } from '../interfaces/hmppsError'
import CaseNotesApiRestClient from '../data/caseNotesApiClient'
import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'
import { CaseNotesPageData } from '../interfaces/pages/caseNotesPageData'
import { CaseNote, CaseNoteAmendment } from '../interfaces/caseNotesApi/caseNote'
import { CaseNoteSource } from '../data/enums/caseNoteSource'

export default class CaseNotesService {
  private caseNotesApiClient: CaseNotesApiClient

  constructor(clientToken: string) {
    this.caseNotesApiClient = new CaseNotesApiRestClient(clientToken)
  }

  /**
   * Validate filters and return errors if appropriate
   *
   * Only `Date from` and `Date to` can be in error
   *
   * @private
   * @param startDate
   * @param endDate
   */
  private validateFilters(startDate: string, endDate: string) {
    const errors: HmppsError[] = []

    if (startDate && !isRealDate(startDate)) {
      errors.push({ text: `'Date from' must be a real date`, href: '#startDate' })
    } else if (startDate && isFuture(parseDate(startDate))) {
      errors.push({ text: `'Date from' must be today or in the past`, href: '#startDate' })
    }

    if (endDate && !isRealDate(endDate)) {
      errors.push({ text: `'Date to' must be a real date`, href: '#endDate' })
    } else if (endDate && startDate && isBefore(parseDate(endDate), parseDate(startDate))) {
      errors.push({ text: `'Date to' must be after or the same as 'Date from'`, href: '#endDate' })
    }

    return errors
  }

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
   * @param prisonerData
   * @param queryParams
   * @param canDeleteSensitiveCaseNotes
   */
  public async get(
    prisonerData: Prisoner,
    queryParams: PagedListQueryParams,
    canDeleteSensitiveCaseNotes: boolean,
  ): Promise<CaseNotesPageData> {
    const sortOptions: SortOption[] = [
      { value: 'creationDateTime,DESC', description: 'Created (most recent)' },
      { value: 'creationDateTime,ASC', description: 'Created (oldest)' },
      { value: 'occurrenceDateTime,DESC', description: 'Happened (most recent)' },
      { value: 'occurrenceDateTime,ASC', description: 'Happened (oldest)' },
    ]

    const errors: HmppsError[] = this.validateFilters(queryParams.startDate, queryParams.endDate)

    let pagedCaseNotes: PagedList
    let types: { value: string; text: string }[] = []
    let subTypes: { value: string; text: string }[] = []
    const typeSubTypeMap: { [key: string]: { value: string; text: string }[] } = {}

    if (!errors.length) {
      const caseNoteTypes = await this.caseNotesApiClient.getCaseNoteTypes()
      types = caseNoteTypes?.map(type => ({ value: type.code, text: type.description }))
      caseNoteTypes.forEach(type => {
        typeSubTypeMap[type.code] = type.subCodes?.map(s => ({ value: s.code, text: s.description }))
      })
      if (queryParams.type) {
        const selectedType = caseNoteTypes.find(type => type.code === queryParams.type)
        if (selectedType) {
          subTypes = selectedType.subCodes?.map(subType => ({
            value: subType.code,
            text: subType.description,
          }))
        }
      }

      pagedCaseNotes = await this.caseNotesApiClient.getCaseNotes(
        prisonerData.prisonerNumber,
        this.mapToApiParams(queryParams),
      )
      pagedCaseNotes.content = pagedCaseNotes.content?.map((caseNote: CaseNote) => ({
        ...caseNote,
        authorName: convertNameCommaToHuman(caseNote.authorName),
        amendments: caseNote.amendments?.map((amendment: CaseNoteAmendment) => ({
          ...amendment,
          authorName: convertNameCommaToHuman(amendment.authorName),
        })),
        deleteLink: caseNote.source === CaseNoteSource.SecureCaseNoteSource && canDeleteSensitiveCaseNotes && '#',
      }))
    }

    return {
      pagedCaseNotes,
      listMetadata: generateListMetadata(
        pagedCaseNotes,
        { ...queryParams, page: undefined }, // Remove page param before generating metadata as this value come from API
        'case notes',
        sortOptions,
        'Sort by',
      ),
      types,
      subTypes,
      typeSubTypeMap,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
      errors,
    }
  }
}
