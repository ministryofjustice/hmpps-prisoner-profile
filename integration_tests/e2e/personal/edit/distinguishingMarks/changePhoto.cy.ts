import { Role } from '../../../../../server/data/enums/role'
import Page from '../../../../pages/page'
import NotFoundPage from '../../../../pages/notFoundPage'
import { markMock, scarMock, tattooMock } from '../../../../../server/data/localMockData/distinguishingMarksMock'
import ChangePhoto from '../../../../pages/editPages/distinguishingMarks/changePhoto'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'
const markId = '100'
const imageId = '100'

const visitChangePhotoTattooPage = ({
  failOnStatusCode = true,
  prisonerNo = prisonerNumber,
  photoId = imageId,
} = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/tattoo/${markId}/photo/${photoId}`,
  })
}

const visitChangePhotoScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber, photoId = imageId } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/scar/${markId}/photo/${photoId}`,
  })
}

const visitChangePhotoMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber, photoId = imageId } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/mark/${markId}/photo/${photoId}`,
  })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
    })

    it('User can change tattoo photo', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })
      cy.task('stubPutDistinguishingMarkPhoto', { imageId, response: tattooMock })
      visitChangePhotoTattooPage()
      const page = Page.verifyOnPageWithTitle(ChangePhoto, 'Change the photo of the tattoo')
      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', prisonerName)
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1().should('contain.text', 'Change the photo of the tattoo')
      page.fileUploadButton().should('not.be.visible')
      page.changeLink().click()
      page.fileUploadButton().should('be.visible')
      page.photoField().attachFile('tat.jpeg')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/tattoo/100')
    })

    it('User can change scar photo', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
      cy.task('stubPutDistinguishingMarkPhoto', { imageId, response: scarMock })
      visitChangePhotoScarPage()
      const page = Page.verifyOnPageWithTitle(ChangePhoto, 'Change the photo of the scar')

      page.h1().should('contain.text', 'Change the photo of the scar')
      page.fileUploadButton().should('not.be.visible')
      page.changeLink().click()
      page.fileUploadButton().should('be.visible')
      page.photoField().attachFile('tat.jpeg')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/scar/100')
    })

    it('User can change mark photo', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMarkPhoto', { imageId, response: markMock })
      visitChangePhotoMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangePhoto, 'Change the photo of the mark')

      page.h1().should('contain.text', 'Change the photo of the mark')
      page.fileUploadButton().should('not.be.visible')
      page.changeLink().click()
      page.fileUploadButton().should('be.visible')
      page.photoField().attachFile('tat.jpeg')
      page.saveBtn().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/mark/100')
    })
  })
})
