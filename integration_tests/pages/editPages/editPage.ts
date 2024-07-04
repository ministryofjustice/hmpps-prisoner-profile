import Page, { PageElement } from '../page'

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

  selectRadio = (code: string) => {
    cy.get(`input[name=radioField][value=${code}]`).click()
  }

  submit = () => {
    cy.get('form').submit()
  }
}
