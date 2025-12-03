import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Overview')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  prisonerOUTBanner = (): PageElement<HTMLDivElement> => cy.get('[data-qa="OUT-establishment-banner"]')

  prisonerTRNBanner = (): PageElement<HTMLDivElement> => cy.get('[data-qa="TRN-establishment-banner"]')

  banner = (): PageElement<HTMLDivElement> => cy.get('.dps-banner')
}
