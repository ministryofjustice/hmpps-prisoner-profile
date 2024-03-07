import type { ProbationDocument } from './ProbationDocuments'

export default interface Conviction {
  title?: string
  offence: string
  date: string
  active: boolean
  documents: ProbationDocument[]
  institutionName?: string
}
