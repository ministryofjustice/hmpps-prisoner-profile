import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'

context('Edit shoe size', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditPage>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/shoe-size`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Enter shoe size',
    successfulFlashMessage: 'Shoe size updated',
    validInputs: [
      { autocompleteInputs: { autocomplete: '' } },
      { autocompleteInputs: { autocomplete: '10' } },
      { autocompleteInputs: { autocomplete: 'UK 10.5 (EU 45)' } },
    ],
    invalidInputs: [
      {
        input: { autocompleteInputs: { autocomplete: '100' } },
        errorMessages: ['This is not a valid shoe size'],
        testDescription: 'Invalid option (100)',
      },
      {
        input: { autocompleteInputs: { autocomplete: 'Example' } },
        errorMessages: ['This is not a valid shoe size'],
        testDescription: 'Invalid option (Example)',
      },
    ],
    redirectAnchor: 'shoe-size',
    isUnrestricted: true,
  })
})
