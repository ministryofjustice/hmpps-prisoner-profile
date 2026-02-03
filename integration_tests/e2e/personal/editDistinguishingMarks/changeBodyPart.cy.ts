import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import NotFoundPage from '../../../pages/notFoundPage'
import { markMock, scarMock, tattooMock } from '../../../../server/data/localMockData/distinguishingMarksMock'
import ChangeBodyPart from '../../../pages/editPages/distinguishingMarks/changeBodyPart'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'
const markId = '100'

const visitChangeTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/tattoo/${markId}/body-part`,
  })
}

const visitChangeScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/scar/${markId}/body-part`,
  })
}

const visitChangeMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({
    failOnStatusCode,
    redirectPath: `/prisoner/${prisonerNo}/personal/distinguishing-marks/mark/${markId}/body-part`,
  })
}

context('Change body part', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })

      visitChangeTattooPage({ failOnStatusCode: false })
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

    it('User can access the change tattoo page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })
      visitChangeTattooPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the tattoo is')
      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', prisonerName)
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1.should('contain.text', 'Change where the tattoo is')
      page.explanationText.should('contain.text', 'You can only select one body part at a time.')

      page.selectionDescription.should('contain.text', 'Front and sides selected')
    })

    it('User can access the change scar page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
      visitChangeScarPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the scar is')

      page.h1.should('contain.text', 'Change where the scar is')
      page.explanationText.should('contain.text', 'You can only select one body part at a time.')

      page.selectionDescription.should('contain.text', 'Left arm selected')
    })

    it('User can access the change mark page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      page.h1.should('contain.text', 'Change where the mark is')
      page.explanationText.should('contain.text', 'You can only select one body part at a time.')

      page.selectionDescription.should('contain.text', 'Left leg selected')
    })

    context('Selecting body parts', () => {
      const bodyParts = [
        { label: 'Neck', description: 'Neck selected', value: 'neck' },
        { label: 'Left arm', description: 'Left arm selected', value: 'left-arm' },
        { label: 'Right arm', description: 'Right arm selected', value: 'right-arm' },
        { label: 'Left leg', description: 'Left leg selected', value: 'left-leg' },
        { label: 'Right leg', description: 'Right leg selected', value: 'right-leg' },
        { label: 'Front and sides', description: 'Front and sides selected', value: 'front-and-sides' },
        { label: 'Left foot', description: 'Left foot selected', value: 'left-foot' },
        { label: 'Right foot', description: 'Right foot selected', value: 'right-foot' },
        { label: 'Left hand', description: 'Left hand selected', value: 'left-hand' },
        { label: 'Right hand', description: 'Right hand selected', value: 'right-hand' },
        { label: 'Back', description: 'Back selected', value: 'back' },
        { label: 'Face and head', description: 'Face and head selected', value: 'face' },
      ]

      bodyParts.forEach(({ label, description, value }) => {
        it(`User can select the ${label}`, () => {
          cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
          visitChangeMarkPage()
          const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

          const selection = page.findBodyPart(label)
          selection.click({ force: true })

          // Click on the left leg twice as it is initially selected so the first click unselects it
          if (value === 'left-leg') {
            selection.click({ force: true })
          }

          page.selectionDescription.should('contain.text', description)
          page.formValue('bodyPart').should('have.value', value)
        })
      })
    })

    it('User can deselect body parts', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.findBodyPart('Face and head')

      selection.click({ force: true })
      page.selectionDescription.should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      selection.click({ force: true })
      page.selectionDescription.should('contain.text', 'No body part selected')
      page.formValue('bodyPart').should('not.have.attr', 'value')

      selection.click({ force: true })
      page.selectionDescription.should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')
    })

    it('User can change body parts', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const headSelection = page.findBodyPart('Face and head')
      const rightArmSelection = page.findBodyPart('Right arm')

      headSelection.click({ force: true })
      page.selectionDescription.should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      rightArmSelection.click({ force: true })
      page.selectionDescription.should('contain.text', 'Right arm selected')
      page.formValue('bodyPart').should('have.value', 'right-arm')
    })

    it('User can submit selection for neck to save and return to summary', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.findBodyPart('Neck')

      selection.click({ force: true })
      page.selectionDescription.should('contain.text', 'Neck selected')
      page.formValue('bodyPart').should('have.value', 'neck')

      page.continueBtn.click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/mark/100')
    })

    it('User can submit selection and move to change location', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.findBodyPart('Face and head')

      selection.click({ force: true })
      page.selectionDescription.should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      page.continueBtn.click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/distinguishing-marks/mark/100/location')
    })

    it('No selection causes a validation error', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.findBodyPart('Left leg')
      selection.click({ force: true })

      page.selectionDescription.should('contain.text', 'No body part selected')

      page.continueBtn.click()
      Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')
      page.validationErrorBox.should('be.visible')
      page.validationErrorBox.should('contain.text', 'Select a body part')
    })
  })
})
