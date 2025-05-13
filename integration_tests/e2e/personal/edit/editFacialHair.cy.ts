import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { facialHairCodesMock } from '../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

context('Edit facial hair', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests({
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
        domain: 'FACIAL_HAIR',
        referenceData: facialHairCodesMock,
      })
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/facial-hair`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Facial hair',
    successfulFlashMessage: 'Facial hair updated',
    validInputs: [{ radioInputs: { radioField: 'BEARDED' } }],
    redirectAnchor: 'appearance',
  })
})
