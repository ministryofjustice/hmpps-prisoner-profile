import type { Attributes, TextOrHtml } from './_internal'

export type GovukErrorMessage = TextOrHtml & {
  id?: string
  classes?: string
  attributes?: Attributes
  visuallyHiddenText?: string
}
