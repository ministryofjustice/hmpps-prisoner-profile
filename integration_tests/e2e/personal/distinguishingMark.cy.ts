import { Role } from '../../../server/data/enums/role'
import Page from '../../pages/page'
import NotFoundPage from '../../pages/notFoundPage'
import NewDistinguishingMark from '../../pages/editPages/newDistinguishingMark'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'

const visitNewTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/edit/distinguishing-mark/add/tattoo` })
}

const visitNewScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/edit/distinguishing-mark/add/scar` })
}

const visitNewMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/edit/distinguishing-mark/add/mark` })
}

context('New distinguishing feature', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [
          {
            caseLoadId: 'MDI',
            currentlyActive: true,
            description: '',
            type: '',
            caseloadFunction: '',
          },
        ],
        roles: [Role.PrisonUser],
      })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubPostNewDistinguishingMark')

      visitNewTattooPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Page contents', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [
          {
            caseLoadId: 'MDI',
            currentlyActive: true,
            description: '',
            type: '',
            caseloadFunction: '',
          },
        ],
        roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'],
      })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubPostNewDistinguishingMark')
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
        { alt: 'Head', description: 'Head selected', value: 'head' },
        { alt: 'Left arm', description: 'Left arm selected', value: 'leftArm' },
        { alt: 'Right arm', description: 'Right arm selected', value: 'rightArm' },
        { alt: 'Left leg', description: 'Left leg selected', value: 'leftLeg' },
        { alt: 'Right leg', description: 'Right leg selected', value: 'rightLeg' },
        { alt: 'Torso', description: 'Torso selected', value: 'torso' },
        { alt: 'Left foot', description: 'Left foot selected', value: 'leftFoot' },
        { alt: 'Right foot', description: 'Right foot selected', value: 'rightFoot' },
        { alt: 'Left hand', description: 'Left hand selected', value: 'leftHand' },
        { alt: 'Right hand', description: 'Right hand selected', value: 'rightHand' },
        { alt: 'Back', description: 'Back selected', value: 'back' },
        { alt: 'Face', description: 'Face selected', value: 'face' },
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

      const selection = page.bodyParts().filter('[alt="Head"]')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Head selected')
      page.formValue('bodyPart').should('have.value', 'head')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'No body part selected')
      page.formValue('bodyPart').should('not.have.attr', 'value')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Head selected')
      page.formValue('bodyPart').should('have.value', 'head')
    })

    it('User can change body parts', () => {
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

      const headSelection = page.bodyParts().filter('[alt="Head"]')
      const rightArmSelection = page.bodyParts().filter('[alt="Right arm"]')

      headSelection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Head selected')
      page.formValue('bodyPart').should('have.value', 'head')

      rightArmSelection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Right arm selected')
      page.formValue('bodyPart').should('have.value', 'rightArm')
    })

    it('User can submit selection', () => {
      visitNewMarkPage()
      const page = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the mark is')

      const selection = page.bodyParts().filter('[alt="Head"]')

      selection.click({ force: true })
      page.selectionDescription().should('contain.text', 'Head selected')
      page.formValue('bodyPart').should('have.value', 'head')

      page.saveAndReturnBtn().click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal')
      cy.location('hash').should('eq', '#appearance')
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
