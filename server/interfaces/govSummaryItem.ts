export interface GovSummaryItem {
  key: { text: string }
  value: { text: string }
}

export interface GovSummaryGroup {
  type: GovSummaryItem
  date: GovSummaryItem
  location: GovSummaryItem
}
