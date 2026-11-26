import type { Attributes, TextOrHtml } from './_internal'

export interface GovukFieldset {
  html?: string
  legend?: GovukFieldsetLegend
  describedBy?: string
  classes?: string
  role?: string
  attributes?: Attributes
}

type GovukFieldsetLegend = TextOrHtml & {
  isPageHeading?: boolean
  classes?: string
}
