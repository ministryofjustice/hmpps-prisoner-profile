import { Role } from '../../../../server/data/enums/role'
import NotFoundPage from '../../../pages/notFoundPage'
import Page from '../../../pages/page'
import EditPage from '../../../pages/editPages/editPage'

export const radiosTests = <TPage extends EditPage>(options: {
  editUrl: string
  prisonerNumber: string
  prisonerName: string
  bookingId: number
  testSetup: () => void
  editPageWithTitle?: new (title: string) => TPage
  editPageTitle?: string
  successfulFlashMessage: string
  radioCode: string
}) => {
  const {
    editUrl,
    prisonerNumber,
    prisonerName,
    testSetup,
    editPageWithTitle,
    editPageTitle,
    successfulFlashMessage,
    radioCode,
  } = options

  context('Edit radios tests', () => {
    beforeEach(() => {
      testSetup()
    })

    /*
    Permissions tests
    For now we just do permissions based on the role so this can be shared
    across multiple tests easily, it might need its own option in the future
  */

    context('Permissions', () => {
      it(`Doesn't let the user access if they don't have the permissions`, () => {
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
      const getPage = () => {
        return Page.verifyOnPageWithTitle(editPageWithTitle, editPageTitle)
      }

      context('Submitting valid update', () => {
        beforeEach(() => {
          cy.signIn({ redirectPath: editUrl })
        })

        it('Can load the edit page', () => {
          const page = getPage()
          page.miniBanner().card().should('be.visible')
          page.miniBanner().name().should('contain.text', prisonerName)
          page.miniBanner().name().should('contain.text', prisonerNumber)
        })

        it('Can submit a valid update', () => {
          const page = getPage()
          page.selectRadio(radioCode)
          page.submit()

          cy.location('pathname').should('eq', '/prisoner/G6123VU/personal')
          cy.location('hash').should('eq', '#appearance')

          page.flashMessage().should('include.text', successfulFlashMessage)
        })
      })
    })
  })
}
