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
  bottomContentLine1Href?: string
  bottomContentLine2?: string | number
  bottomClass: string // 'big' | 'small'
  linkLabel: string
  linkHref: string
}
