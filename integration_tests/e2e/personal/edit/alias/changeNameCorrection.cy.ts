import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'
import { PseudonymResponseMock } from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

context('Change name - correction', () => {
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
    editUrl: `prisoner/${prisonerNumber}/personal/enter-corrected-name`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Enter John Saunders’ correct name',
    successfulFlashMessage: 'Name updated',
    validInputs: [
      {
        textInputs: {
          firstName: 'first',
          middleName1: 'middleone',
          middleName2: 'middletwo',
          lastName: 'last',
        },
      },
      {
        textInputs: {
          firstName: `first'name,,,,,,,,,,,,,,,,,,,,,,,,,`,
          middleName1: '',
          middleName2: '',
          lastName: 'last-name',
        },
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
          },
        },
        errorMessages: [`Enter this person’s first name`, `Enter this person’s last name`],
      },
      {
        testDescription: 'Long values',
        input: {
          textInputs: {
            firstName: 'a'.repeat(36),
            middleName1: 'b'.repeat(36),
            middleName2: 'c'.repeat(36),
            lastName: 'd'.repeat(36),
          },
        },
        errorMessages: [
          'First name must be 35 characters or less',
          'Middle name must be 35 characters or less',
          'Second middle name must be 35 characters or less',
          'Last name must be 35 characters or less',
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
          },
        },
        errorMessages: [
          'First name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Middle name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Second middle name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
          'Last name must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes',
        ],
      },
    ],
    redirectAnchor: 'name',
  })
})
