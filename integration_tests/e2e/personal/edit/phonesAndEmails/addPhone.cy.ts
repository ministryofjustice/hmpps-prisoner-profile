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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonIntegrationCreateContact', { prisonerNumber })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/add-phone-number`,
    validInputs: [
      { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '1234321', phoneExtension: '123' } },
      { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '(123)123123', phoneExtension: '123' } },
      { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '(123)123123' } },
    ],
    invalidInputs: [
      {
        testDescription: 'No phone number type',
        input: {},
        errorMessages: ['Select a phone number type', 'Enter a phone number'],
      },
      {
        testDescription: 'Empty phone number',
        input: { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: '', phoneExtension: '' } },
        errorMessages: ['Enter a phone number'],
      },
      {
        testDescription: 'Phone number too long',
        input: { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: `${'1'.repeat(40)}1` } },
        errorMessages: ['Phone number must be 40 characters or less'],
      },
      {
        testDescription: 'Invalid phone number',
        input: { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: `123 abc 123` } },
        errorMessages: [
          'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
        ],
      },
      {
        testDescription: 'Phone number exceeds the limit and contains invalid characters',
        input: { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneNumber: `${'1'.repeat(40)}a` } },
        errorMessages: [
          'Phone number must be 40 characters or less',
          'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
        ],
      },
      {
        testDescription: 'Phone extension too long',
        input: { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneExtension: `${'1'.repeat(7)}1` } },
        errorMessages: ['Extension must be 7 characters or less'],
      },
      {
        testDescription: 'Phone extension exceeds the limit and contains invalid characters',
        input: { radioInputs: { phoneNumberType: 'HOME' }, textInputs: { phoneExtension: `${'a'.repeat(7)}a` } },
        errorMessages: ['Extension must only contain numbers', 'Extension must be 7 characters or less'],
      },
      {
        testDescription: 'Duplicate phone number',
        input: {
          radioInputs: { phoneNumberType: 'HOME' },
          textInputs: { phoneNumber: '01234567890', phoneExtension: '1234' },
        },
        errorMessages: ['This phone number already exists for this person. Add a new number or edit the saved one'],
      },
    ],
    editPageWithTitle: AddPhoneNumber,
    editPageTitle: 'Add John Saunders’s phone number',
    successfulFlashMessage: 'Phone number updated',
    redirectAnchor: 'phones-and-emails',
    submitButtonId: 'edit-submit-button',
  })
})
