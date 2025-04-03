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
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/shoe-size`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Shoe size',
    successfulFlashMessage: 'Shoe size updated',
    validInputs: [{ textInputs: { shoeSize: '10.0' } }],
    invalidInputs: [
      {
        input: { textInputs: { shoeSize: '0' } },
        errorMessages: ['Enter a whole or half number between 1 and 25'],
        testDescription: '0 input',
      },
      {
        input: { textInputs: { shoeSize: '10.34' } },
        errorMessages: ['Enter a whole or half number between 1 and 25'],
        testDescription: 'Invalid decimal',
      },
      {
        input: { textInputs: { shoeSize: '123' } },
        errorMessages: ['Enter a whole or half number between 1 and 25'],
        testDescription: 'Number too high',
      },
      {
        input: { textInputs: { shoeSize: 'Example' } },
        errorMessages: ["Enter this person's shoe size"],
        testDescription: 'Input with letters',
      },
    ],
    redirectAnchor: 'appearance',
  })
})
