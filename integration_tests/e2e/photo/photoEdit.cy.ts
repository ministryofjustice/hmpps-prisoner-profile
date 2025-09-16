import { Role } from '../../../server/data/enums/role'
import Page from '../../pages/page'
import ConfirmFacialImagePage from '../../pages/photoPages/confirmFacialImagePage'
import EditPhotoPage from '../../pages/photoPages/editPhotoPage'
import PrisonerPhotoPage from '../../pages/photoPages/photoPage'
import NotFoundPage from '../../pages/notFoundPage'
import CaseLoad from '../../../server/data/interfaces/prisonApi/CaseLoad'
import NewWebcamImagePage from '../../pages/photoPages/newWebcamImagePage'
import ConfirmWebcamFacialImagePage from '../../pages/photoPages/confirmWebcamFacialImagePage'

context('Editing the photo', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484
  let page: EditPhotoPage

  context('New image page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit, Role.DpsApplicationDeveloper] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubImageDetails')
      cy.task('stubUpdateProfileImage', { prisonerNumber })
    })

    context('Permissions', () => {
      it('Doesnt let the user access if they dont have the permissions', () => {
        cy.setupUserAuth({ roles: [Role.PrisonUser] })

        cy.signIn({ redirectPath: '/prisoner/G6123VU/image/new', failOnStatusCode: false })
        Page.verifyOnPage(NotFoundPage)
      })

      it('Allows access to users with Prisoner Profile Photo Upload role', () => {
        cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfilePhotoUpload] })

        cy.signIn({ redirectPath: '/prisoner/G6123VU/image/new', failOnStatusCode: false })
        page = Page.verifyOnPage(EditPhotoPage)
      })

      context('Doesnt let the user access if prison doesnt match active caseload', () => {
        it('Displays Page Not Found', () => {
          cy.setupComponentsData({
            caseLoads: [
              { caseLoadId: 'ZZZ', currentlyActive: true } as CaseLoad,
              { caseLoadId: 'ABC', currentlyActive: false } as CaseLoad,
            ],
          })
          cy.task('stubPrisonerData', { prisonerNumber, overrides: { prisonId: 'ABC' } })

          cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image/new' })
          new NotFoundPage().shouldBeDisplayed()
        })
      })
    })

    context('Uploading a new photo', () => {
      beforeEach(() => {
        cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image/new' })
        page = Page.verifyOnPage(EditPhotoPage)
      })

      context('Validation', () => {
        it('No image', () => {
          page.saveAndContinue().click()
          page.errorMessage().should('include.text', 'Select the type of facial image to use')
        })

        it('Incorrect file type', () => {
          page.uploadNew().click()
          page.fileUpload().attachFile('textFile.txt')
          page.saveAndContinue().click()
          page.errorMessage().should('include.text', 'The photo must be a JPG or GIF')
        })
      })

      it('Takes you to the next page', () => {
        page.uploadNew().click()
        page.fileUpload().attachFile('tat.jpeg')
        page.saveAndContinue().click()
        Page.verifyOnPage(ConfirmFacialImagePage)
      })

      it('Allows you to submit the new photo', () => {
        page.uploadNew().click()
        page.fileUpload().attachFile('tat.jpeg')
        page.saveAndContinue().click()
        const confirmationPage = Page.verifyOnPage(ConfirmFacialImagePage)
        confirmationPage.saveAndContinue().click()
        const photoPage = Page.verifyOnPage(PrisonerPhotoPage)
        photoPage.flashMessage().should('include.text', 'Profile image updated')
      })
    })

    context('Uploading a photo with a webcam', () => {
      beforeEach(() => {
        cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image/new' })
        page = Page.verifyOnPage(EditPhotoPage)
      })

      it('Takes you to the next page', () => {
        page.uploadWebcam().click()
        page.saveAndContinue().click()
        Page.verifyOnPage(NewWebcamImagePage)
      })

      it('Allows you to capture and submit a new photo', () => {
        page.uploadWebcam().click()
        page.saveAndContinue().click()
        const webcamPage = Page.verifyOnPage(NewWebcamImagePage)
        webcamPage.webcamFeed().should('be.visible')
        // Wait for webcam to start
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000)
        webcamPage.captureImage().click()
        webcamPage.saveAndContinue().click()
        const confirmationPage = Page.verifyOnPage(ConfirmWebcamFacialImagePage)
        confirmationPage.saveAndContinue().click()
        const photoPage = Page.verifyOnPage(PrisonerPhotoPage)
        photoPage.flashMessage().should('include.text', 'Profile image updated')
      })
    })

    context('Uploading withheld photo', () => {
      beforeEach(() => {
        cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image/new' })
        page = Page.verifyOnPage(EditPhotoPage)
      })

      it('Takes you to the next page', () => {
        page.uploadWithheld().click()
        page.saveAndContinue().click()
        Page.verifyOnPage(ConfirmFacialImagePage)
      })

      it('Allows you to submit the new photo', () => {
        page.uploadNew().click()
        page.fileUpload().attachFile('tat.jpeg')
        page.saveAndContinue().click()
        const confirmationPage = Page.verifyOnPage(ConfirmFacialImagePage)
        confirmationPage.saveAndContinue().click()
        const photoPage = Page.verifyOnPage(PrisonerPhotoPage)
        photoPage.flashMessage().should('include.text', 'Profile image updated')
      })
    })
  })
})
