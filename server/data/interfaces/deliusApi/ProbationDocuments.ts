import Conviction from './Conviction'

export interface ProbationDocument {
  id: string
  name: string
  description?: string
  type: string
  author?: string
  createdAt?: string
}

export default interface ProbationDocuments {
  crn: string
  name: {
    forename: string
    middleName?: string
    surname: string
  }
  documents: ProbationDocument[]
  convictions: Conviction[]
}
