import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { hairCodesMock } from '../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

context('Edit hair', () => {
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
      cy.task('stubAllPersonalCareNeeds')
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'HAIR',
        referenceData: hairCodesMock,
      })
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/hair`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Hair type or colour',
    successfulFlashMessage: 'Hair type or colour updated',
    validInputs: [{ radioInputs: { radioField: 'GREY' } }],
    redirectAnchor: 'appearance',
  })
})
