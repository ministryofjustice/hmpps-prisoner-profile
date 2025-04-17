import Page, { PageElement } from '../../page'

export default class ChangeNamePurposePage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  continueButton = (): PageElement => cy.get('button[type=submit]')

  cancelButton = (): PageElement => cy.getDataQa('cancel-button')

  errorSummary = (): PageElement => cy.get('.govuk-error-summary')
}
