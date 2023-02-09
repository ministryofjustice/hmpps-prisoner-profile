import { MiniSummaryParamType } from '../data/miniSummary/miniSummary'

export type OverviewNonAssociation = {
  name: string
  prisonNumber: string
  location: string
  reciprocalReason: string
}

export type OverviewPage = {
  miniSummaryParamGroupA: MiniSummaryParamType[]
  miniSummaryParamGroupB: MiniSummaryParamType[]
  statuses: object
  nonAssociationRows: OverviewNonAssociation[]
  personalDetails: object
  staffContacts: object
  schedule: object
}
