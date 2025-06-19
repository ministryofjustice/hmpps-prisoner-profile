import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'

context('Add personal IDs', () => {
  const prisonerNumber = 'G6123VU'
  const offenderId = 1
  const seqId = 1
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
      cy.task('stubGetIdentifier', { offenderId, seqId })
      cy.task('stubUpdateIdentifier', { offenderId, seqId })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/pnc/${offenderId}-${seqId}`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Change John Saunders’ PNC number',
    successfulFlashMessage: 'PNC number updated',
    validInputs: [
      {
        textInputs: {
          value: '1998/0494653G',
        },
      },
      {
        textInputs: {
          value: '1998/0494653G',
        },
        textAreaInputs: {
          comment: 'a'.repeat(240),
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: `Duplicate identifier value`,
        input: {
          textInputs: {
            value: '08/359381C',
          },
        },
        errorMessages: ['This PNC number already exists. Enter a different PNC number'],
      },
      {
        testDescription: `No value provided`,
        input: {
          textInputs: {
            value: '',
          },
        },
        errorMessages: ['Enter a number'],
      },
      {
        testDescription: `value field too long`,
        input: {
          textInputs: {
            value: '1'.repeat(21),
          },
        },
        errorMessages: ['Enter the ID number using 20 characters or less'],
      },
      {
        testDescription: `comment field too long`,
        input: {
          textInputs: {
            value: '1998/0494653G',
          },
          textAreaInputs: {
            comment: 'a'.repeat(241),
          },
        },
        errorMessages: ['Enter your comment using 240 characters or less'],
      },
    ],
    redirectAnchor: 'identity-numbers',
  })
})
