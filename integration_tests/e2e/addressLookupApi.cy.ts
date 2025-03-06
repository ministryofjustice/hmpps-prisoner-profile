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
      cy.request('GET', '/api/addresses/find/1,A123BC').then(response => {
        expect(response.status).to.eq(200)
        expect(response.body[0].addressString).to.eq(mockOsAddresses[0].addressString)
        expect(response.body[1].addressString).to.eq(mockOsAddresses[1].addressString)
      })
    })

    it('should return expected address json when no matching addresses are found', () => {
      cy.signIn()
      cy.task('stubFindAddressesByFreeTextSearchNoMatch')
      cy.request('GET', '/api/addresses/find/invalid').then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.length).to.eq(0)
      })
    })

    it('should return error details when the request fails', () => {
      cy.signIn()
      cy.task('stubFindAddressesByFreeTextSearchError')
      cy.request({ method: 'GET', url: '/api/addresses/find/error', failOnStatusCode: false }).then(response => {
        expect(response.status).to.eq(500)
        expect(response.body.error).to.eq('Internal Server Error')
      })
    })

    it('should redirect to the signin page if not logged on when calling the api', () => {
      cy.task('stubFindAddressesByFreeTextSearch')
      cy.request({ method: 'GET', url: '/api/addresses/find/1,A123BC', followRedirect: false }).then(response => {
        expect(response.status).to.eq(302)
      })

      cy.request({ method: 'GET', url: '/api/addresses/find/1,A123BC', followRedirect: true }).then(response => {
        expect(response.status).to.eq(200)
      })

      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('Address Lookup by postcode query', () => {
    it('should return expected address json when matching addresses are found', () => {
      cy.signIn()
      cy.task('stubFindAddressesByPostcode')
      cy.request('GET', '/api/addresses/postcode/A123BC').then(response => {
        expect(response.status).to.eq(200)
        expect(response.body[0].addressString).to.eq(mockOsAddresses[0].addressString)
        expect(response.body[1].addressString).to.eq(mockOsAddresses[1].addressString)
      })
    })

    it('should return expected address json when no matching addresses are found', () => {
      cy.signIn()
      cy.task('stubFindAddressesByPostcodeNoResults')
      cy.request('GET', '/api/addresses/postcode/A12').then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.length).to.eq(0)
      })
    })

    it('should return error details when postcode is invalid', () => {
      cy.signIn()
      cy.task('stubFindAddressesByPostcodeBadRequest')
      cy.request({ method: 'GET', url: '/api/addresses/postcode/invalid', failOnStatusCode: false }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.eq(
          'Requested postcode must contain a minimum of the sector plus 1 digit of the district e.g. SO1. Requested postcode was invalid',
        )
      })
    })

    it('should return error details when the request fails', () => {
      cy.signIn()
      cy.task('stubFindAddressesByPostcodeError')
      cy.request({ method: 'GET', url: '/api/addresses/postcode/error', failOnStatusCode: false }).then(response => {
        expect(response.status).to.eq(500)
        expect(response.body.error).to.eq('Internal Server Error')
      })
    })

    it('should redirect to the signin page if not logged on when calling the api', () => {
      cy.task('stubFindAddressesByPostcode')
      cy.request({ method: 'GET', url: '/api/addresses/postcode/A123BC', followRedirect: false }).then(response => {
        expect(response.status).to.eq(302)
      })

      cy.request({ method: 'GET', url: '/api/addresses/postcode/A123BC', followRedirect: true }).then(response => {
        expect(response.status).to.eq(200)
      })

      Page.verifyOnPage(AuthSignInPage)
    })
  })
})
