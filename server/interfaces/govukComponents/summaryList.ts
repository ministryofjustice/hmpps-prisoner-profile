import type { Attributes, TextOrHtml } from './_internal'

export interface GovukSummaryList {
  rows: GovukSummaryListRow[]
  card?: GovukSummaryListCard
  classes?: string
  attributes?: Attributes
}

export interface GovukSummaryListRow {
  key: GovukSummaryListRowItem
  value: GovukSummaryListRowItem
  actions?: GovukSummaryListActions
  classes?: string
}

export type GovukSummaryListRowItem = TextOrHtml & { classes?: string }

export interface GovukSummaryListActions {
  items: (TextOrHtml & {
    href: string
    visuallyHiddenText?: string
    classes?: string
    attributes?: Attributes
  })[]
  classes?: string
}

interface GovukSummaryListCard {
  title?: TextOrHtml & {
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
    classes?: string
  }
  actions?: GovukSummaryListActions
  classes?: string
  attributes?: Attributes
}
