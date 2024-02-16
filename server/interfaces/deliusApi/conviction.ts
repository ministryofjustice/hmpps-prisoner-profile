import { ProbationDocument } from './probationDocument'

export interface Conviction {
  title?: string
  offence: string
  date: string
  active: boolean
  documents: ProbationDocument[]
  institutionName?: string
}
