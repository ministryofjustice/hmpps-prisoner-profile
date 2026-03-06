export interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?: {
    hidden?: 'hidden'
    disabled?: 'disabled'
  }
}

interface RadioOptionHint {
  text: string
}

export interface RadioOption {
  text: string
  value: string | number
  checked?: boolean
  hint?: RadioOptionHint
  attributes?: {
    hidden?: 'hidden'
    disabled?: 'disabled'
  }
}

export interface CheckboxOptions {
  text: string
  value: string
  subValues?: {
    title: string
    hint: string
    options: CheckboxOptions[]
  }
}
