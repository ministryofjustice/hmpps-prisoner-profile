export interface MiniSummary {
  data: MiniSummaryData
  classes: string
}

export interface MiniSummaryData {
  heading?: string
  topLabel?: string
  topContent?: string | number
  topClass?: string // 'big' | 'small'
  bottomLabel: string
  bottomContentLine1?: string | number
  bottomContentLine2?: string | number // TODO need to implement a link for this as well (updated adjudications mini card - need new ticket)
  bottomClass: string // 'big' | 'small'
  linkLabel: string
  linkHref: string
}
