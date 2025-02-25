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
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo/${markId}/body-part` })
}

const visitChangeScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/scar/${markId}/body-part` })
}

const visitChangeMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/mark/${markId}/body-part` })
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
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
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

      page.h1().should('contain.text', 'Change where the tattoo is')
      page
        .explanationText()
        .should(
          'contain.text',
          'You can only select one body part at a time. You can add more tattoos for this person later.',
        )

      page.selectionDescription().should('contain.text', 'Front and sides selected')
    })

    it('User can access the change scar page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
      visitChangeScarPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the scar is')

      page.h1().should('contain.text', 'Change where the scar is')
      page
        .explanationText()
        .should(
          'contain.text',
          'You can only select one body part at a time. You can add more scars for this person later.',
        )

      page.selectionDescription().should('contain.text', 'Left arm selected')
    })

    it('User can access the change mark page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      page.h1().should('contain.text', 'Change where the mark is')
      page
        .explanationText()
        .should(
          'contain.text',
          'You can only select one body part at a time. You can add more marks for this person later.',
        )

      page.selectionDescription().should('contain.text', 'Left leg selected')
    })

    context('Selecting body parts', () => {
      const areas = [
        { alt: 'Neck', description: 'Neck selected', value: 'neck' },
        { alt: 'Left arm', description: 'Left arm selected', value: 'left-arm' },
        { alt: 'Right arm', description: 'Right arm selected', value: 'right-arm' },
        { alt: 'Left leg', description: 'Left leg selected', value: 'left-leg' },
        { alt: 'Right leg', description: 'Right leg selected', value: 'right-leg' },
        { alt: 'Front and sides', description: 'Front and sides selected', value: 'front-and-sides' },
        { alt: 'Left foot', description: 'Left foot selected', value: 'left-foot' },
        { alt: 'Right foot', description: 'Right foot selected', value: 'right-foot' },
        { alt: 'Left hand', description: 'Left hand selected', value: 'left-hand' },
        { alt: 'Right hand', description: 'Right hand selected', value: 'right-hand' },
        { alt: 'Back', description: 'Back selected', value: 'back' },
        { alt: 'Face and head', description: 'Face and head selected', value: 'face' },
      ]

      areas.forEach(area => {
        it(`User can select the ${area.alt}`, () => {
          cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
          visitChangeMarkPage()
          const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

          const selection = page.bodyParts().filter(`[alt="${area.alt}"]`)
          selection.click({ force: true })

          // Click on the left leg twice as it is initially selected so the first click unselects it
          if (area.value === 'left-leg') {
            selection.click({ force: true })
          }

          page.selectionDescription().should('contain.text', area.description)
          page.formValue('bodyPart').should('have.value', area.value)
        })
      })
    })

    it('User can deselect body parts', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.bodyParts().filter('[alt="Face and head"]')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'No body part selected')
      page.formValue('bodyPart').should('not.have.attr', 'value')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')
    })

    it('User can change body parts', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const headSelection = page.bodyParts().filter('[alt="Face and head"]')
      const rightArmSelection = page.bodyParts().filter('[alt="Right arm"]')

      headSelection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      rightArmSelection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Right arm selected')
      page.formValue('bodyPart').should('have.value', 'right-arm')
    })

    it('User can submit selection for neck to save and return to summary', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.bodyParts().filter('[alt="Neck"]')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Neck selected')
      page.formValue('bodyPart').should('have.value', 'neck')

      page.continueBtn().click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/mark/100')
    })

    it('User can submit selection and move to change location', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.bodyParts().filter('[alt="Face and head"]')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      page.continueBtn().click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/mark/100/location')
    })

    it('No selection causes a validation error', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      cy.task('stubPutDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')

      const selection = page.bodyParts().filter(`[alt="Left leg"]`)
      selection.click({ force: true })

      page.selectionDescription().should('contain.text', 'No body part selected')

      page.continueBtn().click()
      Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the mark is')
      page.validationErrorBox().should('be.visible')
      page.validationErrorBox().should('contain.text', 'Select a body part')
    })
  })
})
