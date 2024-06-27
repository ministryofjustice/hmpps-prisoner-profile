import Page from '../page'

export default class EditPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  fillInTextFields = (fields: { name: string; value: string }[]) => {
    fields.forEach(({ name, value }) => {
      cy.get(`input[name='${name}']`).clear()
      cy.get(`input[name='${name}']`).type(value)
    })
  }

  submit = () => {
    cy.get('form').submit()
  }
}
