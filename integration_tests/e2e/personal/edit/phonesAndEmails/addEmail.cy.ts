import { Role } from '../../../../../server/data/enums/role'
import AddEmailAddress from '../../../../pages/editPages/phonesAndEmails/addEmailAddress'
import { editPageTests } from '../editPageTests'

context('Change email address', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<AddEmailAddress>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonIntegrationCreateContact', { prisonerNumber })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/add-email-address`,
    validInputs: [{ textInputs: { emailAddress: 'someemail@example.com' } }],
    invalidInputs: [
      {
        testDescription: 'Empty email',
        input: { textInputs: { emailAddress: '' } },
        errorMessages: ['Enter an email address'],
      },

      {
        testDescription: 'Email too long',
        input: { textInputs: { emailAddress: `${'1'.repeat(240)}@example.com` } },
        errorMessages: ['Email address must be 240 characters or less'],
      },
      {
        testDescription: 'Invalid format',
        input: { textInputs: { emailAddress: 'notavalidemail' } },
        errorMessages: ['Email address must include an @ symbol'],
      },
      {
        testDescription: 'Duplicate email',
        input: { textInputs: { emailAddress: 'duplicate@example.com' } },
        errorMessages: ['This email address already exists for this person. Add a new email or edit the saved one'],
      },
    ],
    editPageWithTitle: AddEmailAddress,
    editPageTitle: 'Add John Saunders’s email address',
    successfulFlashMessage: 'Email address updated',
    redirectAnchor: 'phones-and-emails',
    submitButtonId: 'edit-submit-button',
  })
})
