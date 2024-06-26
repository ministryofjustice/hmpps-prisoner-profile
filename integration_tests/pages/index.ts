import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Overview')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  prisonerOUTBanner = (): PageElement => cy.get('[data-qa="OUT-establishment-banner"]')

  prisonerTRNBanner = (): PageElement => cy.get('[data-qa="TRN-establishment-banner"]')

  banner = (): PageElement => cy.get('.dps-banner')
}
