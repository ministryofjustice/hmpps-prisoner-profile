import Page, { PageElement } from '../page'

export type CheckboxValue =
  | string
  | { value: string; subValues?: string[]; conditionals?: { textInputs: { [key: string]: string } } }

export default class EditPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  fillInTextFields = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`input[name='${key}']`).clear()
      if (value) {
        cy.get(`input[name='${key}']`).type(value, { delay: 0 })
      }
    })
  }

  fillInTextAreaFields = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`textarea[name='${key}']`).clear()
      if (value) {
        cy.get(`textarea[name='${key}']`)
          .invoke('val', value.substring(0, value.length - 1))
          .type(value.slice(-1))
      }
    })
  }

  selectRadios = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`input[name=${key}][value=${value}]`).click()
    })
  }

  fillInAutocompleteFields = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`input[id=${key}]`).clear()
      // The trailing {esc} is to explicitly close the autocomplete dropdown allowing testing invalid inputs
      cy.get(`input[id=${key}]`).type(`${value}{esc}`)
    })
  }

  fillInAddressAutoSuggestFields = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`div[id=${key}]`).find('.hmpps-js-autosuggest-input').clear()
      cy.get(`div[id=${key}]`).find('.hmpps-js-autosuggest-input').type(`${value}`)
      cy.get('.hmpps-address-autosuggest__option', { timeout: 1000 }).first().click()
    })
  }

  selectCheckboxes = (fields: { [key: string]: CheckboxValue[] }) => {
    Object.entries(fields).forEach(([name, values]) => {
      values.forEach(value => {
        if (typeof value === 'string') {
          cy.get(`input[name=${name}][value=${value}]`).click()
        } else {
          cy.get(`input[name=${name}][value=${value.value}]`).click()
          if (value.subValues) {
            value.subValues.forEach(subValue => {
              cy.get(`input[name=${value.value}-subvalues][value=${subValue}]`).click()
            })
          }
          if (value.conditionals) {
            if (value.conditionals.textInputs) this.fillInTextFields(value.conditionals.textInputs)
          }
        }
      })
    })
  }

  submit = (id?: string) => {
    if (id) {
      cy.get(`button[data-qa=${id}]`).click()
    } else {
      cy.get('button[type="submit"]').click()
    }
  }
}
