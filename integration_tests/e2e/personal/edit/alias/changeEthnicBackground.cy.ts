import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { EditPageInput, editPageTests } from '../editPageTests'
import { PseudonymResponseMock } from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { ethnicityCodesMock } from '../../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

changeEthnicBackground({
  group: 'white',
  pageTitle: `Which of the following best describes John Saunders’ White background?`,
  validInputs: [{ radioInputs: { radioField: 'W1' } }],
})

changeEthnicBackground({
  group: 'mixed',
  pageTitle: `Which of the following best describes John Saunders’ mixed or multiple ethnic groups background?`,
  validInputs: [{ radioInputs: { radioField: 'M1' } }],
})

changeEthnicBackground({
  group: 'asian',
  pageTitle: `Which of the following best describes John Saunders’ Asian or Asian British background?`,
  validInputs: [{ radioInputs: { radioField: 'A1' } }],
})

changeEthnicBackground({
  group: 'black',
  pageTitle: `Which of the following best describes John Saunders’ Black, African, Caribbean or Black British background?`,
  validInputs: [{ radioInputs: { radioField: 'B1' } }],
})

changeEthnicBackground({
  group: 'other',
  pageTitle: `Which of the following best describes John Saunders’ background?`,
  validInputs: [{ radioInputs: { radioField: 'O9' } }],
})

export function changeEthnicBackground(options: { group: string; pageTitle: string; validInputs: EditPageInput[] }) {
  context(`Change ethnic background for group: ${options.group}`, () => {
    const prisonerNumber = 'G6123VU'
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
        cy.task('stubPersonIntegrationGetReferenceData', {
          domain: 'ETHNICITY',
          referenceData: ethnicityCodesMock,
        })
        cy.task('stubGetPseudonyms', { prisonerNumber, response: [{ ...PseudonymResponseMock, ethnicity: undefined }] })
        cy.task('stubUpdatePseudonym', {
          pseudonymId: PseudonymResponseMock.sourceSystemId,
          response: PseudonymResponseMock,
        })
        cy.task('stubAllPersonalCareNeeds')
      },
      editUrl: `prisoner/${prisonerNumber}/personal/${options.group}`,
      editPageWithTitle: EditPage,
      editPageTitle: options.pageTitle,
      successfulFlashMessage: 'Ethnic group updated',
      validInputs: options.validInputs,
      invalidInputs: [
        {
          testDescription: 'No selection',
          input: {},
          errorMessages: [`Select an ethnic group`],
        },
      ],
      redirectAnchor: 'personal-details',
    })
  })
}
