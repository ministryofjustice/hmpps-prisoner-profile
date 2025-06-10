import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'

context('Find UK Address', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditPage>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DpsApplicationDeveloper] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubFindAddressesByFreeTextSearch')
      cy.task('stubFindAddressesByUprn')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/find-uk-address`,
    editPageWithTitle: EditPage,
    editPageTitle: `Find a UK address for John Saunders`,
    validInputs: [{ addressAutoSuggestInputs: { address: '1 The Road' } }],
    invalidInputs: [
      {
        testDescription: 'Nothing selected',
        input: {},
        errorMessages: ['Enter a UK address'],
      },
    ],
    redirectUrl: '/prisoner/G6123VU/personal/confirm-address',
  })
})
