import type { PageElement } from '../page'

export class SelectElement {
  constructor(private selector: string) {}

  get element(): PageElement<HTMLSelectElement> {
    return cy.get(this.selector)
  }

  get options(): Cypress.Chainable<Option[]> {
    return this.element.find<HTMLOptionElement>('option').then($options =>
      $options
        .map<Option>((_index, option) => ({
          value: option.value,
          label: option.innerText.trim(),
          selected: option.selected,
        }))
        .toArray(),
    )
  }

  get value(): Cypress.Chainable<string> {
    return this.element.invoke('val')
  }

  select(label: string): PageElement<HTMLSelectElement> {
    return this.element.select(label)
  }
}

export interface Option {
  value: string
  label: string
  selected: boolean
}
