import type { Attributes, TextOrHtml } from './_internal'

export type GovukHint = TextOrHtml & {
  id?: string
  classes?: string
  attributes?: Attributes
}
