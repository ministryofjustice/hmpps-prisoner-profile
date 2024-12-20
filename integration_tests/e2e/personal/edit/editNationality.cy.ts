import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { NationalityReferenceDataCodes } from '../../../../server/data/localMockData/personIntegrationApi/personIntegrationReferenceDataMock'

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
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdateNationality', { prisonerNumber })
      cy.task('stubGetReferenceDataCodesForDomain', { domain: 'NAT', response: NationalityReferenceDataCodes })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/nationality`,
    editPageWithTitle: EditPage,
    editPageTitle: `What is John Saunders's nationality?`,
    successfulFlashMessage: 'Nationality updated',
    validInputs: { radioInputs: { radioField: 'FREN' } },
    redirectAnchor: 'personal-details',
  })
})
