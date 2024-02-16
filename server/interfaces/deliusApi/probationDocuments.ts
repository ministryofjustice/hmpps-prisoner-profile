import { Conviction } from './conviction'
import { ProbationDocument } from './probationDocument'

export interface ProbationDocuments {
  crn: string
  name: {
    forename: string
    middleName?: string
    surname: string
  }
  documents: ProbationDocument[]
  convictions: Conviction[]
}
