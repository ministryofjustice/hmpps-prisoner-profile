import { yearsBetweenDateStrings } from '../../server/utils/utils'
import Page from '../pages/page'
import PersonalPage from '../pages/personalPage'

const visitPersonalDetailsPage = (): PersonalPage => {
  cy.signIn({ redirectPath: 'prisoner/G6123VU/personal' })
  return Page.verifyOnPage(PersonalPage)
}

context('When signed in', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubInmateDetail', 1102484)
  })

  it('displays the personal details page', () => {
    visitPersonalDetailsPage()
    cy.request('/prisoner/G6123VU/personal').its('body').should('contain', 'Personal')
  })

  context('Personal details card', () => {
    it('Displays all the information from the API', () => {
      const page = visitPersonalDetailsPage()
      page.personalDetails().fullName().should('have.text', 'John Middle Names Saunders')
      // Aliases
      page.personalDetails().preferredName().should('have.text', 'Preferred name goes here')
      page.personalDetails().dateOfBirth().should('include.text', '1990-10-12')
      const expectedAge = yearsBetweenDateStrings(new Date('1990-10-12').toISOString(), new Date().toISOString())
      page.personalDetails().dateOfBirth().should('include.text', `${expectedAge} years old`)
      page.personalDetails().nationality().should('have.text', 'Stateless')
      page.personalDetails().otherNationalities().should('have.text', 'multiple nationalities field')
      page.personalDetails().ethnicGroup().should('have.text', 'White: Eng./Welsh/Scot./N.Irish/British')
      page.personalDetails().religionOrBelief().should('have.text', 'Celestial Church of God')
      page.personalDetails().sex().should('have.text', 'Male')
      page.personalDetails().sexualOrientation().should('have.text', 'Heterosexual / Straight')
      page.personalDetails().marriageOrCivilPartnership().should('have.text', 'No')
      page.personalDetails().numberOfChildren().should('have.text', '2')
      // Languages
      // Other languages
      page.personalDetails().typeOfDiet().should('have.text', 'Voluntary - Pork Free/Fish Free')
      page.personalDetails().smokeOrVaper().should('have.text', 'No')
      page.personalDetails().domesticAbusePerpetrator().should('have.text', 'Not stated')
      page.personalDetails().domesticAbuseVictim().should('have.text', 'Not stated')
      page.personalDetails().socialCareNeeded().should('have.text', 'No')
    })
  })
})
