export default interface GovSummaryItem {
  key: { text: string }
  value: { text?: string; html?: string }
  classes?: string
  attributes?: { [key: string]: string }
}

export interface GovSummaryGroup {
  type: GovSummaryItem
  date: GovSummaryItem
  location: GovSummaryItem
}
