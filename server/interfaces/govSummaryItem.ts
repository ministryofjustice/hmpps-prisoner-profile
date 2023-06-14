export interface GovSummaryItem {
  key: { text: string }
  value: { text?: string; html?: string }
}

export interface GovSummaryGroup {
  type: GovSummaryItem
  date: GovSummaryItem
  location: GovSummaryItem
}
