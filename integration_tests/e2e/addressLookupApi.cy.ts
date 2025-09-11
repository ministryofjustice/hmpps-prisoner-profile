import { mockOsAddresses } from '../../server/data/localMockData/osAddressesMock'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('Address Lookup API', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubDpsHomePage')
    cy.setupUserAuth()
    cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
  })

  context('Free text address search', () => {
    it('should return expected address json when matching addresses are found', () => {
      cy.signIn()
      cy.task('stubFindAddressesByFreeTextSearch')
      cy.request('GET', '/api/addresses/find/1%20The%20Road').then(response => {
        expect(response.status).to.eq(200)
        // The results are sorted:
        expect(response.body.results[0].addressString).to.eq(mockOsAddresses[1].addressString)
        expect(response.body.results[1].addressString).to.eq(mockOsAddresses[0].addressString)
      })
    })

    it('should return expected address json when no matching addresses are found', () => {
      cy.signIn()
      cy.task('stubFindAddressesByFreeTextSearchNoMatch')
      cy.request('GET', '/api/addresses/find/invalid').then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.results.length).to.eq(0)
      })
    })

    it('should return error details when the request fails', () => {
      cy.signIn()
      cy.task('stubFindAddressesByFreeTextSearchError')
      cy.request({ method: 'GET', url: '/api/addresses/find/error', failOnStatusCode: false }).then(response => {
        expect(response.status).to.eq(500)
      })
    })

    it('should redirect to the signin page if not logged on when calling the api', () => {
      cy.task('stubFindAddressesByFreeTextSearch')
      cy.request({ method: 'GET', url: '/api/addresses/find/1%20The%20Road', followRedirect: false }).then(response => {
        expect(response.status).to.eq(302)
      })

      cy.request({ method: 'GET', url: '/api/addresses/find/1%20The%20Road', followRedirect: true }).then(response => {
        expect(response.status).to.eq(200)
      })

      Page.verifyOnPage(AuthSignInPage)
    })
  })
})
