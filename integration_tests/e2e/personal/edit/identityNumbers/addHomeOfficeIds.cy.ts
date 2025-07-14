import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'

context('Add personal IDs', () => {
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
      cy.task('stubAddIdentifiers', { prisonerNumber })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/home-office-id-numbers`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Add Home Office ID numbers',
    successfulFlashMessage: 'Identity numbers added',
    validInputs: [
      {
        checkboxInputs: {
          '"homeOfficeReference[selected]"': [
            { value: 'homeOfficeReference', conditionals: { textInputs: { 'homeOfficeReference[value]': '99999' } } },
          ],
          '"portReference[selected]"': [
            { value: 'portReference', conditionals: { textInputs: { 'portReference[value]': 'A123' } } },
          ],
        },
      },
      {
        checkboxInputs: {
          '"homeOfficeReference[selected]"': [
            {
              value: 'homeOfficeReference',
              conditionals: { textInputs: { 'homeOfficeReference[value]': '1'.repeat(20) } },
            },
          ],
          '"portReference[selected]"': [
            {
              value: 'portReference',
              conditionals: { textInputs: { 'portReference[value]': '1'.repeat(20) } },
            },
          ],
          '"cid[selected]"': [{ value: 'cid', conditionals: { textInputs: { 'cid[value]': '1'.repeat(20) } } }],
        },
        textAreaInputs: {
          'homeOfficeReference[comment]': 'a'.repeat(240),
          'portReference[comment]': 'a'.repeat(240),
          'cid[comment]': 'a'.repeat(240),
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: `Duplicate identifier value`,
        input: {
          checkboxInputs: {
            '"homeOfficeReference[selected]"': [
              {
                value: 'homeOfficeReference',
                conditionals: { textInputs: { 'homeOfficeReference[value]': 'A1234567' } },
              },
            ],
          },
        },
        errorMessages: [
          'This Home Office reference number already exists. Enter a different Home Office reference number',
        ],
      },
      {
        testDescription: `Checkboxes selected but no values provided`,
        input: {
          checkboxInputs: {
            '"homeOfficeReference[selected]"': ['homeOfficeReference'],
            '"portReference[selected]"': ['portReference'],
            '"cid[selected]"': ['cid'],
          },
        },
        errorMessages: [
          'Enter this person’s Home Office reference number',
          'Enter this person’s port reference number',
          'Enter this person’s Case Information Database (CID) number',
        ],
      },
      {
        testDescription: `value fields too long`,
        input: {
          checkboxInputs: {
            '"homeOfficeReference[selected]"': [
              {
                value: 'homeOfficeReference',
                conditionals: { textInputs: { 'homeOfficeReference[value]': '1'.repeat(21) } },
              },
            ],
            '"portReference[selected]"': [
              {
                value: 'portReference',
                conditionals: { textInputs: { 'portReference[value]': '1'.repeat(21) } },
              },
            ],
            '"cid[selected]"': [
              {
                value: 'cid',
                conditionals: { textInputs: { 'cid[value]': '1'.repeat(21) } },
              },
            ],
          },
        },
        errorMessages: [
          'Enter the Home Office reference number using 20 characters or less',
          'Enter the port reference number using 20 characters or less',
          'Enter the Case Information Database (CID) number using 20 characters or less',
        ],
      },
      {
        testDescription: `comment fields too long`,
        input: {
          checkboxInputs: {
            '"homeOfficeReference[selected]"': [
              { value: 'homeOfficeReference', conditionals: { textInputs: { 'homeOfficeReference[value]': '99999' } } },
            ],
            '"portReference[selected]"': [
              {
                value: 'portReference',
                conditionals: { textInputs: { 'portReference[value]': 'A123' } },
              },
            ],
            '"cid[selected]"': [
              {
                value: 'cid',
                conditionals: { textInputs: { 'cid[value]': '1' } },
              },
            ],
          },
          textAreaInputs: {
            'homeOfficeReference[comment]': 'a'.repeat(241),
            'portReference[comment]': 'a'.repeat(241),
            'cid[comment]': 'a'.repeat(241),
          },
        },
        errorMessages: [
          'Enter your comment using 240 characters or less',
          'Enter your comment using 240 characters or less',
          'Enter your comment using 240 characters or less',
          'Enter your comment using 240 characters or less',
          'Enter your comment using 240 characters or less',
          'Enter your comment using 240 characters or less',
        ],
      },
    ],
    redirectAnchor: 'identity-numbers',
  })
})
