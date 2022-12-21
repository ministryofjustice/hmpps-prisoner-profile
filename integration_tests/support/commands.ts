Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/prisoner/jdhf')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
