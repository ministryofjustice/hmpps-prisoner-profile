Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/prisoner/G6123VU')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
