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
    editUrl: `prisoner/${prisonerNumber}/personal/personal-id-numbers`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Add personal ID numbers',
    successfulFlashMessage: 'Identity numbers updated',
    validInputs: [
      {
        checkboxInputs: {
          '"drivingLicence[selected]"': [
            { value: 'drivingLicence', conditionals: { textInputs: { 'drivingLicence[value]': 'ABCDE123456A99AA' } } },
          ],
          '"nationalInsurance[selected]"': [
            { value: 'nationalInsurance', conditionals: { textInputs: { 'nationalInsurance[value]': 'AA123456A' } } },
          ],
        },
      },
      {
        checkboxInputs: {
          '"drivingLicence[selected]"': [
            { value: 'drivingLicence', conditionals: { textInputs: { 'drivingLicence[value]': '1'.repeat(20) } } },
          ],
          '"nationalInsurance[selected]"': [
            {
              value: 'nationalInsurance',
              conditionals: { textInputs: { 'nationalInsurance[value]': '1'.repeat(20) } },
            },
          ],
          '"parkrun[selected]"': [
            { value: 'parkrun', conditionals: { textInputs: { 'parkrun[value]': '1'.repeat(20) } } },
          ],
          '"passport[selected]"': [
            { value: 'passport', conditionals: { textInputs: { 'passport[value]': '1'.repeat(20) } } },
          ],
          '"staffId[selected]"': [
            { value: 'staffId', conditionals: { textInputs: { 'staffId[value]': '1'.repeat(20) } } },
          ],
          '"uln[selected]"': [
            {
              value: 'uln',
              conditionals: { textInputs: { 'uln[value]': '1'.repeat(20) } },
            },
          ],
        },
        textAreaInputs: {
          'drivingLicence[comment]': 'a'.repeat(240),
          'nationalInsurance[comment]': 'a'.repeat(240),
          'parkrun[comment]': 'a'.repeat(240),
          'passport[comment]': 'a'.repeat(240),
          'staffId[comment]': 'a'.repeat(240),
          'uln[comment]': 'a'.repeat(240),
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: `Duplicate identifier value`,
        input: {
          checkboxInputs: {
            '"drivingLicence[selected]"': [
              {
                value: 'drivingLicence',
                conditionals: { textInputs: { 'drivingLicence[value]': 'ABCD/123456/AB9DE' } },
              },
            ],
          },
        },
        errorMessages: ['This driving licence number already exists. Enter a different driving licence number'],
      },
      {
        testDescription: `Checkboxes selected but no values provided`,
        input: {
          checkboxInputs: {
            '"drivingLicence[selected]"': ['drivingLicence'],
            '"nationalInsurance[selected]"': ['nationalInsurance'],
            '"parkrun[selected]"': ['parkrun'],
            '"passport[selected]"': ['passport'],
            '"staffId[selected]"': ['staffId'],
            '"uln[selected]"': ['uln'],
          },
        },
        errorMessages: [
          'Enter this person’s driving licence number',
          'Enter this person’s National Insurance number',
          'Enter this person’s parkrun number',
          'Enter this person’s passport number',
          'Enter this person’s staff ID card number',
          'Enter this person’s unique learner number (ULN)',
        ],
      },
      {
        testDescription: `value fields too long`,
        input: {
          checkboxInputs: {
            '"drivingLicence[selected]"': [
              { value: 'drivingLicence', conditionals: { textInputs: { 'drivingLicence[value]': '1'.repeat(21) } } },
            ],
            '"nationalInsurance[selected]"': [
              {
                value: 'nationalInsurance',
                conditionals: { textInputs: { 'nationalInsurance[value]': '1'.repeat(21) } },
              },
            ],
            '"parkrun[selected]"': [
              {
                value: 'parkrun',
                conditionals: { textInputs: { 'parkrun[value]': '1'.repeat(21) } },
              },
            ],
            '"passport[selected]"': [
              {
                value: 'passport',
                conditionals: { textInputs: { 'passport[value]': '1'.repeat(21) } },
              },
            ],
            '"staffId[selected]"': [
              { value: 'staffId', conditionals: { textInputs: { 'staffId[value]': '1'.repeat(21) } } },
            ],
            '"uln[selected]"': [{ value: 'uln', conditionals: { textInputs: { 'uln[value]': '1'.repeat(21) } } }],
          },
        },
        errorMessages: [
          'Enter the driving licence number using 20 characters or less',
          'Enter the National Insurance number using 20 characters or less',
          'Enter the parkrun number using 20 characters or less',
          'Enter the passport number using 20 characters or less',
          'Enter the staff ID card number using 20 characters or less',
          'Enter the unique learner number (ULN) using 20 characters or less',
        ],
      },
      {
        testDescription: `comment fields too long`,
        input: {
          checkboxInputs: {
            '"drivingLicence[selected]"': [
              {
                value: 'drivingLicence',
                conditionals: { textInputs: { 'drivingLicence[value]': 'ABCDE123456A99AA' } },
              },
            ],
            '"nationalInsurance[selected]"': [
              {
                value: 'nationalInsurance',
                conditionals: { textInputs: { 'nationalInsurance[value]': 'AA123456A' } },
              },
            ],
            '"parkrun[selected]"': [
              {
                value: 'parkrun',
                conditionals: { textInputs: { 'parkrun[value]': '1' } },
              },
            ],
            '"passport[selected]"': [
              {
                value: 'passport',
                conditionals: { textInputs: { 'passport[value]': '1' } },
              },
            ],
            '"staffId[selected]"': [{ value: 'staffId', conditionals: { textInputs: { 'staffId[value]': '1' } } }],
            '"uln[selected]"': [{ value: 'uln', conditionals: { textInputs: { 'uln[value]': '1' } } }],
          },
          textAreaInputs: {
            'drivingLicence[comment]': 'a'.repeat(241),
            'nationalInsurance[comment]': 'a'.repeat(241),
            'parkrun[comment]': 'a'.repeat(241),
            'passport[comment]': 'a'.repeat(241),
            'staffId[comment]': 'a'.repeat(241),
            'uln[comment]': 'a'.repeat(241),
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
