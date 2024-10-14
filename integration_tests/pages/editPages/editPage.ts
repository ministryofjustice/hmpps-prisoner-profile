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

  selectRadios = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`input[name=${key}][value=${value}]`).click()
    })
  }

  selectCheckboxes = (fields: { [key: string]: CheckboxValue[] }) => {
    Object.entries(fields).forEach(([name, values]) => {
      values.forEach(value => {
        if (typeof value === 'string') {
          cy.get(`input[name=${name}][value=${value}]`).click()
        } else {
          cy.get(`input[name=${name}][value=${value.value}]`).click()
          value.subValues.forEach(subValue => {
            cy.get(`input[name=${value.value}-subvalues][value=${value.value}__${subValue}]`).click()
          })
        }
      })
    })
  }

  submit = () => {
    cy.get('form').submit()
  }
}
