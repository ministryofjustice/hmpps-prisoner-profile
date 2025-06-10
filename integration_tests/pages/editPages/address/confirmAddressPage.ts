import Page, { PageElement } from '../../page'

export default class ConfirmAddressPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  addressLine = index => cy.get('.address-summary > p').eq(index)

  backLink = (): PageElement => cy.getDataQa('back-link')

  useThisAddressButton = (): PageElement => cy.getDataQa('use-this-address-button')

  cancelLink = (): PageElement => cy.getDataQa('cancel-link')
}
