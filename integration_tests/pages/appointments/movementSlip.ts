import Page from '../page'

export class MovementSlip extends Page {
  constructor() {
    super('Movement authorisation')
  }

  shouldHaveNoHeaderOrFooter(): Cypress.Chainable {
    cy.get('header').should('not.exist')
    cy.get('footer').should('not.exist')
    return cy.end()
  }

  get labels(): Cypress.Chainable<Label[]> {
    return cy.get<HTMLDivElement>('.movement-slip .movement-slip__section__values').then($divs => {
      return $divs
        .map<Label>((_index, div) => {
          const $div = Cypress.$(div)
          return {
            title: $div.find(':first').text().trim(),
            description: $div.find(':last').text().trim(),
          }
        })
        .toArray()
    })
  }
}

export interface Label {
  title: string
  description: string
}
