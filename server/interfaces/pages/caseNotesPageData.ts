import { PagedList } from '../prisonApi/pagedList'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'

export interface CaseNotesPageData {
  pagedCaseNotes: PagedList
  listMetadata: ListMetadata
  types: { value: string; text: string }[]
  subTypes: { value: string; text: string }[]
  typeSubTypeMap: { [key: string]: { value: string; text: string }[] }
  fullName: string
  errors: HmppsError[]
}
