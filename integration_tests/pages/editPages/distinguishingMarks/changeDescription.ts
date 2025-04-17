import Page, { PageElement } from '../../page'

export default class ChangeDescription extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  descriptionField = (): PageElement => cy.get('textarea')

  saveBtn = (): PageElement => cy.get('button[type=submit]')
}
