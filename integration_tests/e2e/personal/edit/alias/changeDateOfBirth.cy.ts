import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'
import { PseudonymResponseMock } from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

context('Change date of birth', () => {
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
      cy.task('stubUpdatePseudonym', {
        pseudonymId: PseudonymResponseMock.sourceSystemId,
        response: PseudonymResponseMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/date-of-birth`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Date of birth',
    successfulFlashMessage: 'Date of birth updated',
    validInputs: [
      {
        textInputs: {
          'dateOfBirth-day': '01',
          'dateOfBirth-month': '02',
          'dateOfBirth-year': '1990',
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: 'Empty values',
        input: {
          textInputs: {
            'dateOfBirth-day': '',
            'dateOfBirth-month': '',
            'dateOfBirth-year': '',
          },
        },
        errorMessages: [`Enter this person’s date of birth`],
      },
      {
        testDescription: 'Invalid date',
        input: {
          textInputs: {
            'dateOfBirth-day': '99',
            'dateOfBirth-month': '99',
            'dateOfBirth-year': '9999',
          },
        },
        errorMessages: ['Date of birth must be a real date'],
      },
      {
        testDescription: 'Invalid characters',
        input: {
          textInputs: {
            'dateOfBirth-day': '?',
            'dateOfBirth-month': '*',
            'dateOfBirth-year': ',',
          },
        },
        errorMessages: ['Date of birth must be a real date'],
      },
      {
        testDescription: 'Missing date field',
        input: {
          textInputs: {
            'dateOfBirth-day': '',
            'dateOfBirth-month': '02',
            'dateOfBirth-year': '1990',
          },
        },
        errorMessages: ['Date of birth must include a day'],
      },
      {
        testDescription: 'Too young (14 years ago)',
        input: {
          textInputs: {
            'dateOfBirth-day': `${new Date().getDate()}`,
            'dateOfBirth-month': `${new Date().getMonth() + 1}`,
            'dateOfBirth-year': `${new Date().getFullYear() - 14}`,
          },
        },
        errorMessages: ['This person cannot be younger than 15 years old. Enter a valid date of birth'],
      },
      {
        testDescription: 'Too old (126 years ago)',
        input: {
          textInputs: {
            'dateOfBirth-day': `${new Date().getDate()}`,
            'dateOfBirth-month': `${new Date().getMonth() + 1}`,
            'dateOfBirth-year': `${new Date().getFullYear() - 126}`,
          },
        },
        errorMessages: ['This person cannot be older than 125 years old. Enter a valid date of birth'],
      },
    ],
    redirectAnchor: 'date-of-birth',
  })
})
