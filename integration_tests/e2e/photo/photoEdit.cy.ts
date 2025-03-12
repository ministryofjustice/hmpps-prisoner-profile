import { Role } from '../../../server/data/enums/role'
import Page from '../../pages/page'
import ConfirmFacialImagePage from '../../pages/photoPages/confirmFacialImagePage'
import EditPhotoPage from '../../pages/photoPages/editPhotoPage'
import { permissionsTests } from '../permissionsTests'

context('Editing the photo', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484
  let page: EditPhotoPage

  context('New image page', () => {
    beforeEach(() => {
      cy.setupBannerStubs({
        prisonerNumber,
        bookingId,
      })
    })

    context('Permissions', () => {
      const visitPage = prisonerDataOverrides => {
        cy.setupBannerStubs({
          prisonerNumber,
          bookingId,
          prisonerDataOverrides: { ...prisonerDataOverrides, category: 'B' },
        })
        cy.task('stubImageDetails')
        cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image/new' })
      }
      permissionsTests({
        prisonerNumber,
        visitPage,
        pageToDisplay: EditPhotoPage,
        options: { additionalRoles: [Role.DpsApplicationDeveloper], preventGlobalAccess: true },
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
    })
  })
})
