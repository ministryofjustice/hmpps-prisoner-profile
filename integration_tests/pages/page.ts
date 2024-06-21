export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  static verifyOnPageWithTitle<T>(constructor: new (title: string) => T, title: string): T {
    return new constructor(title)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('body').then($ele => {
      if ($ele.find('h1').length > 0) {
        cy.get('h1').contains(this.title)
      } else {
        // Do Something
      }
    })
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  apiErrorBanner = (): PageElement => cy.get('.hmpps-api-error-banner')

  flashMessage = (): PageElement => cy.get('.hmpps-flash-message')
}
