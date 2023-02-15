import { MiniSummary } from './miniSummary'
import { PersonalDetails } from './personalDetails'

export type OverviewNonAssociation = {
  text: string
}[]

export type OverviewPage = {
  miniSummaryGroupA: MiniSummary[]
  miniSummaryGroupB: MiniSummary[]
  statuses: object
  nonAssociations: OverviewNonAssociation[]
  personalDetails: PersonalDetails
  staffContacts: object
  schedule: object
}
