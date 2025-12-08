import type { PageElement } from '../page'

export class RadioButtons {
  constructor(private readonly name: string) {}

  get inputElements(): PageElement<HTMLInputElement> {
    return cy.get(`input[name="${this.name}"]`)
  }

  get fieldset(): PageElement<HTMLFieldSetElement> {
    return this.inputElements.parents('fieldset')
  }

  get options(): Cypress.Chainable<Option[]> {
    return this.inputElements.then($inputs =>
      $inputs
        .map<Option>((_index, input) => {
          return {
            value: input.value,
            label: Cypress.$(`[for="${input.id}"]`).text().trim(),
            selected: input.checked,
          }
        })
        .toArray(),
    )
  }

  get value(): Cypress.Chainable<string> {
    return this.inputElements.invoke('val')
  }

  selectOption(label: string): PageElement<HTMLLabelElement> {
    return this.fieldset.find('label').contains(label).click()
  }
}

export interface Option {
  value: string
  label: string
  selected: boolean
}
