import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import EditHeight from '../../../pages/editPages/heightImperial'
import NotFoundPage from '../../../pages/notFoundPage'
import Page from '../../../pages/page'

function editPageTests<TPage extends EditPage>(options: {
  editUrl: string
  prisonerNumber: string
  bookingId: number
  testSetup: () => void
  validInputs: (page: TPage) => void
  editPage?: new () => TPage
  editPageWithTitle?: new (title: string) => TPage
  editPageTitle?: string
  successfulFlashMessage: string
}) {
  const { editUrl, testSetup, validInputs, editPage, editPageWithTitle, editPageTitle, successfulFlashMessage } =
    options
  let page: TPage

  context('Edit page tests', () => {
    beforeEach(() => {
      testSetup()
    })

    /* 
    Permissions tests
    For now we just do permissions based on the role so this can be shared
    across multiple tests easily, it might need its own option in the future
  */

    context('Permissions', () => {
      it('Doesnt let the user access if they dont have the permissions', () => {
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

        cy.signIn({ failOnStatusCode: false, redirectPath: editUrl })
        Page.verifyOnPage(NotFoundPage)
      })
    })

    context('User with permissions', () => {
      context('Submitting valid responses', () => {
        const getPage = (): TPage => {
          if (editPage) {
            return Page.verifyOnPage(editPage)
          }

          if (editPageWithTitle) {
            return Page.verifyOnPageWithTitle(editPageWithTitle, editPageTitle)
          }

          return null
        }

        beforeEach(() => {
          cy.signIn({ redirectPath: editUrl })
        })

        it('Can load the edit page', () => {
          getPage()
        })

        it('Can submit a valid response', () => {
          page = getPage()
          validInputs(page)
          page.submit()
          page.flashMessage().should('include.text', successfulFlashMessage)
        })
      })
    })
  })
}

context('Edit height (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  editPageTests<EditHeight>({
    prisonerNumber,
    bookingId,
    testSetup: () => {
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
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/height`,
    validInputs: page => {
      page.fillInTextFields({ editField: '125' })
    },
    editPageWithTitle: EditHeight,
    editPageTitle: 'Edit Height',
    successfulFlashMessage: 'Height edited',
  })
})

context('Edit height (Imperial)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  editPageTests<EditHeight>({
    prisonerNumber,
    bookingId,
    testSetup: () => {
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
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/height/imperial`,
    validInputs: page => {
      page.fillInTextFields({ feet: '5', inches: '3' })
    },
    editPageWithTitle: EditHeight,
    editPageTitle: 'Edit height',
    successfulFlashMessage: 'Height edited',
  })
})
