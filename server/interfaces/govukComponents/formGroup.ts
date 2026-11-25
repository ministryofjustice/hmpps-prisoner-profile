import type { Attributes, TextOrHtml } from './_internal'

export interface GovukFormGroup {
  classes?: string
  attributes?: Attributes
  beforeInput?: TextOrHtml
  afterInput?: TextOrHtml
}
