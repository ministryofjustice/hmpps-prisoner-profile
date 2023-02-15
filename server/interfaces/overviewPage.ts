import { MiniSummary } from './miniSummary'

export type OverviewNonAssociation = {
  text: string
}[]

export type OverviewPage = {
  miniSummaryGroupA: MiniSummary[]
  miniSummaryGroupB: MiniSummary[]
  statuses: object
  nonAssociations: OverviewNonAssociation[]
  personalDetails: object
  staffContacts: object
  schedule: object
}
