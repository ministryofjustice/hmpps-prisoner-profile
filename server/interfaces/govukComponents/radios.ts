import type { Attributes, TextOrHtml } from './_internal'
import type { GovukErrorMessage } from './errorMessage'
import type { GovukFieldset } from './fieldset'
import type { GovukFormGroup } from './formGroup'
import type { GovukHint } from './hint'

export interface GovukRadios {
  name: string
  items: GovukRadiosItem[]
  value?: string
  fieldset?: GovukFieldset
  formGroup?: GovukFormGroup
  hint?: GovukHint
  errorMessage?: GovukErrorMessage
  idPrefix?: string
  classes?: string
  attributes?: Attributes
}

export type GovukRadiosItem =
  | (TextOrHtml & {
      value: string
      id?: string
      checked?: boolean
      disabled?: boolean
      attributes?: Attributes
      label?: {
        classes?: string
        attributes?: Attributes
      }
      hint?: GovukHint
      conditional?: { html: string }
    })
  | { divider: string }
