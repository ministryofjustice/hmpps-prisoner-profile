import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import EditHeight from '../../../pages/editPages/heightImperial'
import NotFoundPage from '../../../pages/notFoundPage'
import Page from '../../../pages/page'

context('Edit height (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  context('Permissions', () => {
    it('Doesnt let the user access if they dont have the permissions', () => {
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
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/personal/edit/height' })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('User with permissions', () => {
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
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.signIn({ redirectPath: 'prisoner/G6123VU/personal/edit/height' })
    })

    it('Display the edit page', () => {
      Page.verifyOnPageWithTitle(EditPage, 'Edit Height')
    })

    it('Submits the form', () => {
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      const page = Page.verifyOnPageWithTitle(EditHeight, 'Edit Height')
      page.fillInTextFields([{ name: 'editField', value: '125' }])
      page.submit()
      page.flashMessage().should('include.text', 'Height edited')
    })

    describe('Imperial', () => {
      it('Submits the form', () => {
        cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
        cy.task('stubPersonalCareNeeds')
        const page = Page.verifyOnPageWithTitle(EditHeight, 'Edit Height')
        page.switchUnits()
        page.fillInTextFields([
          { name: 'feet', value: '5' },
          { name: 'inches', value: '3' },
        ])
        page.submit()
        page.flashMessage().should('include.text', 'Height edited')
      })
    })
  })
})
