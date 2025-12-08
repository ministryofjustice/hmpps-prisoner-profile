import type { PageElement } from '../page'

export class Checkboxes {
  constructor(private readonly name: string) {}

  get inputElements(): PageElement<HTMLInputElement> {
    return cy.get(`input[name="${this.name}"]`)
  }

  get container(): PageElement<HTMLDivElement> {
    return this.inputElements.parents('.govuk-checkboxes')
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

  toggleOption(label: string): PageElement<HTMLLabelElement> {
    return this.container.find('label').contains(label).click()
  }
}

export interface Option {
  value: string
  label: string
  selected: boolean
}
