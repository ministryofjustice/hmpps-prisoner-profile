import { Role } from '../../../../../server/data/enums/role'
import AddPhoneNumber from '../../../../pages/editPages/phonesAndEmails/addPhoneNumber'
import { editPageTests } from '../editPageTests'

context('Change phone number', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<AddPhoneNumber>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonIntegrationCreateContact', { prisonerNumber })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/add-phone-number`,
    validInputs: [
      { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '1234321', phoneExtension: '123' } },
      { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '(123) 123 123', phoneExtension: '123' } },
      { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '(123) 123 123' } },
    ],
    invalidInputs: [
      {
        testDescription: 'Empty phone number',
        input: { textInputs: { phoneNumber: '', phoneExtension: '' } },
        errorMessages: ['Enter a phone number'],
      },
      {
        testDescription: 'Phone number too long',
        input: { textInputs: { phoneNumber: `${'1'.repeat(40)}1` } },
        errorMessages: ['Phone number must be 40 characters or less'],
      },
      {
        testDescription: 'Invalid phone number',
        input: { textInputs: { phoneNumber: `123 abc 123` } },
        errorMessages: ['Phone numbers must only contain numbers or brackets'],
      },
      {
        testDescription: 'Phone extension too long',
        input: { textInputs: { phoneExtension: `${'1'.repeat(7)}1` } },
        errorMessages: ['Extension must be 7 characters or less'],
      },
    ],
    editPageWithTitle: AddPhoneNumber,
    editPageTitle: 'Add John Saunders’s phone number',
    successfulFlashMessage: 'Phone number updated',
    redirectAnchor: 'phones-and-emails',
    submitButtonId: 'edit-submit-button',
  })
})
