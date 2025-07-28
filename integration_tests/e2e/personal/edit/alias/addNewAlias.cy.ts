import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'
import { PseudonymResponseMock } from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

context('Add new alias', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditPage>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubGetPseudonyms', { prisonerNumber, response: [PseudonymResponseMock] })
      cy.task('stubCreatePseudonym', {
        prisonerNumber,
        response: PseudonymResponseMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/enter-alias-details`,
    personalPageHref: 'personal/enter-alias-details',
    editPageWithTitle: EditPage,
    editPageTitle: 'Enter alias details',
    successfulFlashMessage: 'Alias added',
    validInputs: [
      {
        textInputs: {
          firstName: 'first',
          middleName1: 'middleone',
          middleName2: 'middletwo',
          lastName: 'last',
          'dateOfBirth-day': '01',
          'dateOfBirth-month': '02',
          'dateOfBirth-year': '1990',
        },
        radioInputs: { sex: 'M' },
      },
      {
        textInputs: {
          firstName: `first'name,,,,,,,,,,,,,,,,,,,,,,,,,`,
          middleName1: '',
          middleName2: '',
          lastName: 'last-name',
          'dateOfBirth-day': '20',
          'dateOfBirth-month': '07',
          'dateOfBirth-year': '1969',
        },
        radioInputs: { sex: 'F' },
      },
    ],
    invalidInputs: [
      {
        testDescription: 'Empty values',
        input: {
          textInputs: {
            firstName: '',
            middleName1: '',
            middleName2: '',
            lastName: '',
            'dateOfBirth-day': '',
            'dateOfBirth-month': '',
            'dateOfBirth-year': '',
          },
          radioInputs: { sex: 'F' },
        },
        errorMessages: [
          `Enter this person’s first name`,
          `Enter this person’s last name`,
          `Enter this person’s date of birth`,
        ],
      },
      {
        testDescription: 'Long values',
        input: {
          textInputs: {
            firstName: 'a'.repeat(36),
            middleName1: 'b'.repeat(36),
            middleName2: 'c'.repeat(36),
            lastName: 'd'.repeat(36),
            'dateOfBirth-day': '99',
            'dateOfBirth-month': '99',
            'dateOfBirth-year': '9999',
          },
          radioInputs: { sex: 'F' },
        },
        errorMessages: [
          'First name must be 35 characters or less',
          'Middle name must be 35 characters or less',
          'Second middle name must be 35 characters or less',
          'Last name must be 35 characters or less',
          'Date of birth must be a real date',
        ],
      },
      {
        testDescription: 'Invalid characters',
        input: {
          textInputs: {
            firstName: '1',
            middleName1: '$',
            middleName2: 'é',
            lastName: '+',
            'dateOfBirth-day': '?',
            'dateOfBirth-month': '*',
            'dateOfBirth-year': ',',
          },
          radioInputs: { sex: 'F' },
        },
        errorMessages: [
          'First name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Middle name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Second middle name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Last name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Date of birth must be a real date',
        ],
      },
      {
        testDescription: 'Missing date field',
        input: {
          textInputs: {
            firstName: 'first',
            middleName1: 'middleone',
            middleName2: 'middletwo',
            lastName: 'last',
            'dateOfBirth-day': '',
            'dateOfBirth-month': '02',
            'dateOfBirth-year': '1990',
          },
          radioInputs: { sex: 'M' },
        },
        errorMessages: ['Date of birth must include a day'],
      },
    ],
    redirectAnchor: 'aliases',
  })
})
