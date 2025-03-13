import { Role } from '../../../../../server/data/enums/role'
import Page from '../../../../pages/page'
import NotFoundPage from '../../../../pages/notFoundPage'
import { distinguishingMarkMultiplePhotosMock } from '../../../../../server/data/localMockData/distinguishingMarksMock'
import ViewAllImagesForDistinguishingMark from '../../../../pages/editPages/distinguishingMarks/viewAllImagesForDistinguishingMark'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const markId = 100

const visitAllImagesPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo/${markId}/all-photos` })
}

context('View all images for a distinguishing mark', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })

      visitAllImagesPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Page contents', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: distinguishingMarkMultiplePhotosMock })
    })

    it('Displays the prisoner banner', () => {
      visitAllImagesPage({ failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(
        ViewAllImagesForDistinguishingMark,
        `John Saunders’ left arm tattoo photos`,
      )

      page.miniBanner().name().should('be.visible')
      page.miniBanner().card().should('be.visible')
    })

    it('Displays the distinguishing mark details', () => {
      visitAllImagesPage({ failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(
        ViewAllImagesForDistinguishingMark,
        `John Saunders’ left arm tattoo photos`,
      )

      page.summary().should('contain.text', 'Location')
      page.summary().should('contain.text', 'Arm (general)')
      page.summary().should('contain.text', 'Description')
      page.summary().should('contain.text', 'Tribal arm tattoo')
    })

    it('Displays all images for the distinguishing mark', () => {
      visitAllImagesPage({ failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(
        ViewAllImagesForDistinguishingMark,
        `John Saunders’ left arm tattoo photos`,
      )

      page.images().should('have.length', '6')
    })

    it('Links back to the prisoner profile', () => {
      visitAllImagesPage({ failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(
        ViewAllImagesForDistinguishingMark,
        `John Saunders’ left arm tattoo photos`,
      )

      page
        .prisonerProfileLink()
        .should('be.visible')
        .and('contain.text', `Return to the prisoner's profile`)
        .and('have.attr', 'href')
        .and('include', '/personal#marks')
    })
  })

  context('Print page', () => {
    it('Clicking the print link should open a print dialog', () => {
      visitAllImagesPage({ failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(
        ViewAllImagesForDistinguishingMark,
        `John Saunders’ left arm tattoo photos`,
      )
      cy.window().then(win => {
        cy.stub(win, 'print').as('Print')
      })

      const printLink = page.printLink()
      printLink.should('be.visible').and('contain.text', `Print all`)
      printLink.click()
      cy.get('@Print').should('have.been.called')
    })
  })
})
