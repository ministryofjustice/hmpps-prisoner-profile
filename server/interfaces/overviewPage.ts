import { MiniSummaryParamType } from '../data/miniSummary/miniSummary'

export type OverviewNonAssociation = {
  text: string
}[]

export type OverviewPage = {
  miniSummaryParamGroupA: MiniSummaryParamType[]
  miniSummaryParamGroupB: MiniSummaryParamType[]
  statuses: object
  nonAssociations: OverviewNonAssociation[]
  personalDetails: object
  staffContacts: object
  schedule: object
}
