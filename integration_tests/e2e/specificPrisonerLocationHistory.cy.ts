import { CaseLoadsDummyDataA } from '../../server/data/localMockData/caseLoad'

context.skip('Specific Prisoner Location History', () => {
  const url =
    '/prisoner/G6123VU/location-history?fromDate=2023-07-11T14:56:16&toDate=2023-08-17T12:00:00&locationId=25762&agencyId=MDI'
  const specificPrisonerLocationHistoryPageUrl = () => {
    cy.signIn({ redirectPath: url })
  }

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupSpecificLocationHistoryPageStubs({
      prisonerNumber: 'G6123VU',
      bookingId: 1102484,
      locationId: '25762',
      staffId: 123,
      prisonId: 'MDI',
      caseLoads: CaseLoadsDummyDataA,
    })
  })

  it('Specific prisoner location hoistory page is displayed', () => {
    specificPrisonerLocationHistoryPageUrl()
    cy.request(url).its('body').should('contain', 'Location details')
  })
})
