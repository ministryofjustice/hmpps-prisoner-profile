import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import NotFoundPage from '../../../pages/notFoundPage'
import NewDistinguishingMark from '../../../pages/editPages/distinguishingMarks/newDistinguishingMark'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'

const visitNewTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo` })
}

const visitNewScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/scar` })
}

const visitNewMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/mark` })
}

context('New distinguishing feature', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubPostNewDistinguishingMark', { prisonerNumber })

      visitNewTattooPage({ failOnStatusCode: false })
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
      cy.task('stubPostNewDistinguishingMark', { prisonerNumber })
    })
    it('User can access the new tattoo page', () => {
      visitNewTattooPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the tattoo is')
      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', prisonerName)
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1().should('contain.text', 'Select where the tattoo is')
      page
        .explanationText()
        .should(
          'contain.text',
          'You can only select one body part at a time. You can add more tattoos for this person later.',
        )

      page.selectionDescription().should('contain.text', 'No body part selected')
    })

    it('User can access the new scar page', () => {
      visitNewScarPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the scar is')

      page.h1().should('contain.text', 'Select where the scar is')
      page
        .explanationText()
        .should(
          'contain.text',
          'You can only select one body part at a time. You can add more scars for this person later.',
        )

      page.selectionDescription().should('contain.text', 'No body part selected')
    })

    it('User can access the new mark page', () => {
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

      page.h1().should('contain.text', 'Select where the mark is')
      page
        .explanationText()
        .should(
          'contain.text',
          'You can only select one body part at a time. You can add more marks for this person later.',
        )

      page.selectionDescription().should('contain.text', 'No body part selected')
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
          visitNewMarkPage()
          const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

          const selection = page.bodyParts().filter(`[alt="${area.alt}"]`)
          selection.click({ force: true })

          page.selectionDescription().should('contain.text', area.description)
          page.formValue('bodyPart').should('have.value', area.value)
        })
      })
    })

    it('User can deselect body parts', () => {
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

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
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

      const headSelection = page.bodyParts().filter('[alt="Face and head"]')
      const rightArmSelection = page.bodyParts().filter('[alt="Right arm"]')

      headSelection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      rightArmSelection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Right arm selected')
      page.formValue('bodyPart').should('have.value', 'right-arm')
    })

    it('User can submit selection', () => {
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

      const selection = page.bodyParts().filter('[alt="Face and head"]')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Face and head selected')
      page.formValue('bodyPart').should('have.value', 'face')

      page.saveAndReturnBtn().click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal')
      cy.location('hash').should('eq', '#marks')
    })

    it('No selection causes a validation error', () => {
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

      page.saveAndReturnBtn().click()
      Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')
      page.validationErrorBox().should('be.visible')
      page.validationErrorBox().should('contain.text', 'Select a body part')
    })
  })
})
