import { MiniSummaryParamType } from '../data/miniSummary/miniSummary'

export type OverviewPage = {
  miniSummaryParamGroupA: MiniSummaryParamType[]
  miniSummaryParamGroupB: MiniSummaryParamType[]
  statuses: object
  nonAssociationRows: object
  personalDetails: object
  staffContacts: object
  schedule: object
}
