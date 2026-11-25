import type { Attributes, TextOrHtml } from './_internal'
import type { GovukErrorMessage } from './errorMessage'
import type { GovukFormGroup } from './formGroup'
import type { GovukHint } from './hint'

export interface GovukSelect {
  id?: string
  name: string
  items: GovukSelectItem[]
  value?: string
  disabled?: boolean
  describedBy?: string
  label: TextOrHtml & {
    for?: string
    isPageHeading?: boolean
    classes?: string
    attributes?: Attributes
  }
  hint?: GovukHint
  errorMessage?: GovukErrorMessage
  formGroup?: GovukFormGroup
  classes?: string
  attributes?: Attributes
}

export interface GovukSelectItem {
  text: string
  value?: string
  selected?: boolean
  disabled?: boolean
  attributes?: Attributes
}
