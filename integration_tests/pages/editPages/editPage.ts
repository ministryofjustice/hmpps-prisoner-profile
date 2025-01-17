import Page, { PageElement } from '../page'

type CheckboxValue = string | { value: string; subValues: string[] }
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
        cy.get(`input[name='${key}']`).type(value)
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

  fillInAutocompleteField = ({ value }: { value: string }) => {
    cy.get('.autocomplete__input').clear()
    if (value) {
      // The trailing {esc} is to explicitly close the autocomplete dropdown allowing testing invalid inputs
      cy.get('.autocomplete__input').type(`${value}{esc}`)
    }
  }

  selectCheckboxes = (fields: { [key: string]: CheckboxValue[] }) => {
    Object.entries(fields).forEach(([name, values]) => {
      values.forEach(value => {
        if (typeof value === 'string') {
          cy.get(`input[name=${name}][value=${value}]`).click()
        } else {
          cy.get(`input[name=${name}][value=${value.value}]`).click()
          value.subValues.forEach(subValue => {
            cy.get(`input[name=${value.value}-subvalues][value=${subValue}]`).click()
          })
        }
      })
    })
  }

  submit = () => {
    cy.get('button[type="submit"]').click()
  }
}
