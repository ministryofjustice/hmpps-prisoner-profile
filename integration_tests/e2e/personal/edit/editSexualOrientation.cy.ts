import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { SexualOrientationReferenceDataCodesMock } from '../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

context('Edit sexual orientation', () => {
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
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdate', { prisonerNumber })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'SEXO',
        referenceData: SexualOrientationReferenceDataCodesMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/sexual-orientation`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Which of the following best describes John Saunders’ sexual orientation?',
    successfulFlashMessage: 'Sexual orientation updated',
    validInputs: [{ radioInputs: { radioField: 'ND' } }],
    redirectAnchor: 'sexual-orientation',
  })
})
