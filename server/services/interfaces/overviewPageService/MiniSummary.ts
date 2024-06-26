export default interface MiniSummaryData {
  heading?: string
  topLabel?: string
  topContent?: string | number
  topClass?: string // 'big' | 'small'
  bottomLabel: string
  bottomContentLine1?: string | number
  bottomContentLine1Href?: string
  bottomContentLine2?: string | number
  bottomContentLine3?: string | number
  bottomContentError?: string
  bottomClass: string // 'big' | 'small'
  linkLabel?: string
  linkHref?: string
}
