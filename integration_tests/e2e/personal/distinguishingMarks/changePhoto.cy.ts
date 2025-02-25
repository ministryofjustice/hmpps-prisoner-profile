import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import NotFoundPage from '../../../pages/notFoundPage'
import { markMock, scarMock, tattooMock } from '../../../../server/data/localMockData/distinguishingMarksMock'
import ChangePhoto from '../../../pages/editPages/distinguishingMarks/changePhoto'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'
const markId = '100'

const visitChangePhotoTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo/${markId}/photo` })
}

const visitChangePhotoScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/scar/${markId}/photo` })
}

const visitChangePhotoMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/mark/${markId}/photo` })
}

context('Change distinguishing mark photo', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })

      visitChangePhotoTattooPage({ failOnStatusCode: false })
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
    })

    it('User can change tattoo photo', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })
      cy.task('stubPostDistinguishingMarkPhoto', { prisonerNumber, response: tattooMock })
      visitChangePhotoTattooPage()
      const page = Page.verifyOnPageWithTitle(ChangePhoto, 'Change the photo of the tattoo')
      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', prisonerName)
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1().should('contain.text', 'Change the photo of the tattoo')
      page.changeLink().click()
      cy.location('search').should('eq', '?upload')
      page.photoField().attachFile('tat.jpeg')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/tattoo/100')
    })

    it('User can change scar photo', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
      cy.task('stubPostDistinguishingMarkPhoto', { prisonerNumber, response: scarMock })
      visitChangePhotoScarPage()
      const page = Page.verifyOnPageWithTitle(ChangePhoto, 'Change the photo of the scar')

      page.h1().should('contain.text', 'Change the photo of the scar')
      page.changeLink().click()
      cy.location('search').should('eq', '?upload')
      page.photoField().attachFile('tat.jpeg')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/scar/100')
    })

    it('User can change mark photo', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPostDistinguishingMarkPhoto', { prisonerNumber, response: markMock })
      visitChangePhotoMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangePhoto, 'Change the photo of the mark')

      page.h1().should('contain.text', 'Change the photo of the mark')
      page.changeLink().click()
      cy.location('search').should('eq', '?upload')
      page.photoField().attachFile('tat.jpeg')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/mark/100')
    })
  })
})
