import Page from '../page'

export default class EditPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  fillInTextFields = (fields: { [key: string]: string }) => {
    Object.entries(fields).forEach(([key, value]) => {
      cy.get(`input[name='${key}']`).clear()
      cy.get(`input[name='${key}']`).type(value)
    })
  }

  submit = () => {
    cy.get('form').submit()
  }
}
