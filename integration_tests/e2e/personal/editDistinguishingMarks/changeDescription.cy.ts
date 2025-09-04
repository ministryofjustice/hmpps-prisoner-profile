import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import NotFoundPage from '../../../pages/notFoundPage'
import { markMock, scarMock, tattooMock } from '../../../../server/data/localMockData/distinguishingMarksMock'
import ChangeDescription from '../../../pages/editPages/distinguishingMarks/changeDescription'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'
const markId = '100'

const visitChangeDescriptionTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/tattoo/${markId}/description`,
  })
}

const visitChangeDescriptionScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/scar/${markId}/description`,
  })
}

const visitChangeDescriptionMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/mark/${markId}/description`,
  })
}

context('Change distinguishing mark description', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })

      visitChangeDescriptionTattooPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Page contents', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubPutDistinguishingMark', { prisonerNumber })
    })

    it('User can change tattoo description', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })
      visitChangeDescriptionTattooPage()
      const page = Page.verifyOnPageWithTitle(ChangeDescription, 'Change the description of the tattoo')
      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', prisonerName)
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1().should('contain.text', 'Change the description of the tattoo')
      page.descriptionField().should('contain.text', 'Hand sewn mickey mouse stormtrooper')
      page.descriptionField().type('UPDATED')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/tattoo/100')
    })

    it('User can change scar description', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
      visitChangeDescriptionScarPage()
      const page = Page.verifyOnPageWithTitle(ChangeDescription, 'Change the description of the scar')

      page.h1().should('contain.text', 'Change the description of the scar')
      page.descriptionField().should('contain.text', 'Horrible arm scar')
      page.descriptionField().type('UPDATED')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/scar/100')
    })

    it('User can change mark description', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeDescriptionMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeDescription, 'Change the description of the mark')

      page.h1().should('contain.text', 'Change the description of the mark')
      page.descriptionField().should('contain.text', 'Bump')
      page.descriptionField().type('UPDATED')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/mark/100')
    })
  })
})
