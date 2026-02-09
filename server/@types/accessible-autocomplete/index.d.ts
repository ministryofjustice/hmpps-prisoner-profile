/**
 * GOV.UK Accessible Autocomplete types based on v3.0.1
 * https://github.com/alphagov/accessible-autocomplete/tree/96bf629a2c02b98bbd924dbc575692730e5789ee
 * NB: this was recreated manually from javascript sources and remains incomplete!
 */

declare module 'accessible-autocomplete' {
  export type Source =
    | string[]
    | {
        (query: string, populateResults: (options: string[]) => void): void
      }

  export interface Options {
    element: HTMLElement
    id: string
    source: Source
    inputClasses?: string | null
    hintClasses?: string | null
    menuAttributes?: DOMStringMap
    menuClasses?: string | null
    autoselect?: boolean
    confirmOnBlur?: boolean
    cssNamespace?: string
    defaultValue?: string
    displayMenu?: 'inline' | 'overlay'
    minLength?: number
    name?: string
    onConfirm?: () => void
    placeholder?: string
    required?: boolean
    showAllValues?: boolean
    showNoOptionsFound?: boolean
    templates?: {
      inputValue: (input: string) => string
      suggestion: (input: string) => string
    }
    dropdownArrow?: (obj: { className: string }) => string
    tNoResults?: () => string
    tStatusQueryTooShort?: (chars: number) => string
    tStatusNoResults?: () => string
    tStatusSelectedOption?: (selectedOption: string, length: number, index: number) => string
    tStatusResults?: (length: number, contentSelectedOption: string) => string
    tAssistiveHint?: () => string
  }

  function accessibleAutocomplete(options: Options): void

  export interface EnhanceSelectOptions extends Omit<Partial<Options>, 'element'> {
    selectElement: HTMLElement
    preserveNullOptions?: boolean
  }

  function enhanceSelectElement(options: EnhanceSelectOptions): void

  accessibleAutocomplete.enhanceSelectElement = enhanceSelectElement

  export default accessibleAutocomplete
}
