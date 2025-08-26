import { Role } from '../../../../../server/data/enums/role'
import Page from '../../../../pages/page'
import NotFoundPage from '../../../../pages/notFoundPage'
import { markMock, scarMock, tattooMock } from '../../../../../server/data/localMockData/distinguishingMarksMock'
import AddPhoto from '../../../../pages/editPages/distinguishingMarks/addPhoto'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'
const markId = '100'

const visitAddPhotoScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/scar/${markId}/photo`,
  })
}

const visitAddPhotoMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/mark/${markId}/photo`,
  })
}

const visitAddPhotoTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/tattoo/${markId}/photo`,
  })
}

context('Add distinguishing mark photo', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })

      visitAddPhotoTattooPage({ failOnStatusCode: false })
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

    context('User can add tattoo photo', () => {
      beforeEach(() => {
        cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })
        cy.task('stubPostDistinguishingMarkPhoto', { prisonerNumber, response: tattooMock })
        visitAddPhotoTattooPage()
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the tattoo')
        page.miniBanner().card().should('be.visible')
        page.miniBanner().name().should('contain.text', prisonerName)
        page.miniBanner().name().should('contain.text', prisonerNumber)

        page.fileUploadButton().should('be.visible')
        page.imagePreview().should('not.be.visible')
        page.imageFilename().should('not.be.visible')
        page.changeLink().should('not.be.visible')
        page.photoField().attachFile('tat.jpeg')

        page.fileUploadButton().should('not.be.visible')
        page.imagePreview().should('be.visible')
        page.imageFilename().should('have.text', 'tat.jpeg')
        page.changeLink().should('be.visible')
      })

      it('Save photo and return to profile', () => {
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the tattoo')
        page.saveAndReturnBtn().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/tattoo/100')
      })

      it('Save photo and add another', () => {
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the tattoo')
        page.saveAndAddAnotherBtn().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/tattoo/100/photo')

        page.fileUploadButton().should('be.visible')
        page.imagePreview().should('not.be.visible')
        page.imageFilename().should('not.be.visible')
        page.changeLink().should('not.be.visible')
      })
    })

    context('User can add scar photo', () => {
      beforeEach(() => {
        cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
        cy.task('stubPostDistinguishingMarkPhoto', { prisonerNumber, response: scarMock })
        visitAddPhotoScarPage()
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the scar')
        page.miniBanner().card().should('be.visible')
        page.miniBanner().name().should('contain.text', prisonerName)
        page.miniBanner().name().should('contain.text', prisonerNumber)

        page.fileUploadButton().should('be.visible')
        page.imagePreview().should('not.be.visible')
        page.imageFilename().should('not.be.visible')
        page.changeLink().should('not.be.visible')
        page.photoField().attachFile('tat.jpeg')

        page.fileUploadButton().should('not.be.visible')
        page.imagePreview().should('be.visible')
        page.imageFilename().should('have.text', 'tat.jpeg')
        page.changeLink().should('be.visible')
      })

      it('Save photo and return to profile', () => {
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the scar')
        page.saveAndReturnBtn().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/scar/100')
      })

      it('Save photo and add another', () => {
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the scar')
        page.saveAndAddAnotherBtn().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/scar/100/photo')

        page.fileUploadButton().should('be.visible')
        page.imagePreview().should('not.be.visible')
        page.imageFilename().should('not.be.visible')
        page.changeLink().should('not.be.visible')
      })
    })

    context('User can add mark photo', () => {
      beforeEach(() => {
        cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
        cy.task('stubPostDistinguishingMarkPhoto', { prisonerNumber, response: markMock })
        visitAddPhotoMarkPage()
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the mark')
        page.miniBanner().card().should('be.visible')
        page.miniBanner().name().should('contain.text', prisonerName)
        page.miniBanner().name().should('contain.text', prisonerNumber)

        page.fileUploadButton().should('be.visible')
        page.imagePreview().should('not.be.visible')
        page.imageFilename().should('not.be.visible')
        page.changeLink().should('not.be.visible')
        page.photoField().attachFile('tat.jpeg')

        page.fileUploadButton().should('not.be.visible')
        page.imagePreview().should('be.visible')
        page.imageFilename().should('have.text', 'tat.jpeg')
        page.changeLink().should('be.visible')
      })

      it('Save photo and return to profile', () => {
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the mark')
        page.saveAndReturnBtn().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/mark/100')
      })

      it('Save photo and add another', () => {
        const page = Page.verifyOnPageWithTitle(AddPhoto, 'Add the photo of the mark')
        page.saveAndAddAnotherBtn().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/mark/100/photo')

        page.fileUploadButton().should('be.visible')
        page.imagePreview().should('not.be.visible')
        page.imageFilename().should('not.be.visible')
        page.changeLink().should('not.be.visible')
      })
    })
  })
})
