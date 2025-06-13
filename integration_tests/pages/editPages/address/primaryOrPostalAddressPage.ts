import Page, { PageElement } from '../../page'

export default class PrimaryOrPostalAddressPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  addressLine = index => cy.get('.address-summary > p').eq(index)

  checkBox = option => cy.get(`input[name=primaryOrPostal][value=${option}]`)

  warning = option => cy.getDataQa(`existing-${option}-warning`)

  backLink = (): PageElement => cy.getDataQa('back-link')

  submitButton = (): PageElement => cy.getDataQa('submit-button')

  cancelLink = (): PageElement => cy.getDataQa('cancel-link')
}
