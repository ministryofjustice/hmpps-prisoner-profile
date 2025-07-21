import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'

context('Add justice IDs', () => {
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
    editUrl: `prisoner/${prisonerNumber}/personal/justice-id-numbers`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Add justice ID numbers',
    successfulFlashMessage: 'Identity numbers updated',
    validInputs: [
      {
        checkboxInputs: {
          '"pnc[selected]"': [{ value: 'pnc', conditionals: { textInputs: { 'pnc[value]': '2002/0073319Z' } } }],
          '"cro[selected]"': [{ value: 'cro', conditionals: { textInputs: { 'cro[value]': '097501/98T' } } }],
        },
      },
      {
        checkboxInputs: {
          '"pnc[selected]"': [{ value: 'pnc', conditionals: { textInputs: { 'pnc[value]': '2002/0073319Z' } } }],
          '"cro[selected]"': [{ value: 'cro', conditionals: { textInputs: { 'cro[value]': '097501/98T' } } }],
          '"prisonLegacySystem[selected]"': [
            {
              value: 'prisonLegacySystem',
              conditionals: { textInputs: { 'prisonLegacySystem[value]': '1'.repeat(20) } },
            },
          ],
          '"probationLegacySystem[selected]"': [
            {
              value: 'probationLegacySystem',
              conditionals: { textInputs: { 'probationLegacySystem[value]': '1'.repeat(20) } },
            },
          ],
          '"scottishPnc[selected]"': [
            { value: 'scottishPnc', conditionals: { textInputs: { 'scottishPnc[value]': '1'.repeat(20) } } },
          ],
          '"yjaf[selected]"': [{ value: 'yjaf', conditionals: { textInputs: { 'yjaf[value]': '1'.repeat(20) } } }],
        },
        textAreaInputs: {
          'cro[comment]': 'a'.repeat(240),
          'pnc[comment]': 'a'.repeat(240),
          'prisonLegacySystem[comment]': 'a'.repeat(240),
          'probationLegacySystem[comment]': 'a'.repeat(240),
          'scottishPnc[comment]': 'a'.repeat(240),
          'yjaf[comment]': 'a'.repeat(240),
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: `Invalid PNC and CRO values`,
        input: {
          checkboxInputs: {
            '"pnc[selected]"': [{ value: 'pnc', conditionals: { textInputs: { 'pnc[value]': '123' } } }],
            '"cro[selected]"': [{ value: 'cro', conditionals: { textInputs: { 'cro[value]': '123' } } }],
          },
        },
        errorMessages: [
          'Enter a PNC number in the correct format, exactly as it appears on the document',
          'Enter a CRO number in the correct format, exactly as it appears on the document',
        ],
      },
      {
        testDescription: `Duplicate identifier value`,
        input: {
          checkboxInputs: {
            '"cro[selected]"': [{ value: 'cro', conditionals: { textInputs: { 'cro[value]': '400862/08W' } } }],
          },
        },
        errorMessages: ['This CRO number already exists. Enter a different CRO number'],
      },
      {
        testDescription: `Checkboxes selected but no values provided`,
        input: {
          checkboxInputs: {
            '"pnc[selected]"': ['pnc'],
            '"cro[selected]"': ['cro'],
            '"prisonLegacySystem[selected]"': ['prisonLegacySystem'],
            '"probationLegacySystem[selected]"': ['probationLegacySystem'],
            '"scottishPnc[selected]"': ['scottishPnc'],
            '"yjaf[selected]"': ['yjaf'],
          },
        },
        errorMessages: [
          'Enter this person’s PNC number',
          'Enter this person’s CRO number',
          'Enter this person’s prison legacy system number',
          'Enter this person’s probation legacy system number',
          'Enter this person’s Scottish PNC number',
          'Enter this person’s Youth Justice Application Framework (YJAF) number',
        ],
      },
      {
        testDescription: `value fields too long`,
        input: {
          checkboxInputs: {
            '"pnc[selected]"': [{ value: 'pnc', conditionals: { textInputs: { 'pnc[value]': '1'.repeat(21) } } }],
            '"cro[selected]"': [{ value: 'cro', conditionals: { textInputs: { 'cro[value]': '1'.repeat(21) } } }],
            '"prisonLegacySystem[selected]"': [
              {
                value: 'prisonLegacySystem',
                conditionals: { textInputs: { 'prisonLegacySystem[value]': '1'.repeat(21) } },
              },
            ],
            '"probationLegacySystem[selected]"': [
              {
                value: 'probationLegacySystem',
                conditionals: { textInputs: { 'probationLegacySystem[value]': '1'.repeat(21) } },
              },
            ],
            '"scottishPnc[selected]"': [
              { value: 'scottishPnc', conditionals: { textInputs: { 'scottishPnc[value]': '1'.repeat(21) } } },
            ],
            '"yjaf[selected]"': [{ value: 'yjaf', conditionals: { textInputs: { 'yjaf[value]': '1'.repeat(21) } } }],
          },
        },
        errorMessages: [
          'Enter a CRO number in the correct format, exactly as it appears on the document',
          'Enter a PNC number in the correct format, exactly as it appears on the document',
          'Enter the prison legacy system number using 20 characters or less',
          'Enter the probation legacy system number using 20 characters or less',
          'Enter the Scottish PNC number using 20 characters or less',
          'Enter the Youth Justice Application Framework (YJAF) number using 20 characters or less',
        ],
      },
      {
        testDescription: `comment fields too long`,
        input: {
          checkboxInputs: {
            '"pnc[selected]"': [{ value: 'pnc', conditionals: { textInputs: { 'pnc[value]': '2002/0073319Z' } } }],
            '"cro[selected]"': [{ value: 'cro', conditionals: { textInputs: { 'cro[value]': '097501/98T' } } }],
            '"prisonLegacySystem[selected]"': [
              {
                value: 'prisonLegacySystem',
                conditionals: { textInputs: { 'prisonLegacySystem[value]': '1' } },
              },
            ],
            '"probationLegacySystem[selected]"': [
              {
                value: 'probationLegacySystem',
                conditionals: { textInputs: { 'probationLegacySystem[value]': '1' } },
              },
            ],
            '"scottishPnc[selected]"': [
              { value: 'scottishPnc', conditionals: { textInputs: { 'scottishPnc[value]': '1' } } },
            ],
            '"yjaf[selected]"': [{ value: 'yjaf', conditionals: { textInputs: { 'yjaf[value]': '1' } } }],
          },
          textAreaInputs: {
            'cro[comment]': 'a'.repeat(241),
            'pnc[comment]': 'a'.repeat(241),
            'prisonLegacySystem[comment]': 'a'.repeat(241),
            'probationLegacySystem[comment]': 'a'.repeat(241),
            'scottishPnc[comment]': 'a'.repeat(241),
            'yjaf[comment]': 'a'.repeat(241),
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
