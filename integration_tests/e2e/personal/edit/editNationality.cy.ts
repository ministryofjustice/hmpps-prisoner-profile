import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { NationalityReferenceDataCodesMock } from '../../../../server/data/localMockData/personIntegrationReferenceDataMock'

context('Edit nationality', () => {
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
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdate', { prisonerNumber })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'NAT',
        referenceData: NationalityReferenceDataCodesMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/nationality`,
    editPageWithTitle: EditPage,
    editPageTitle: `What is John Saunders's nationality?`,
    successfulFlashMessage: 'Nationality updated',
    validInputs: [{ radioInputs: { radioField: 'FREN' } }],
    redirectAnchor: 'personal-details',
  })
})
