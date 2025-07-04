import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { faceCodesMock } from '../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

context('Edit face shape', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'FACE',
        referenceData: faceCodesMock,
      })
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/face-shape`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Face shape',
    successfulFlashMessage: 'Face shape updated',
    validInputs: [{ radioInputs: { radioField: 'OVAL' } }],
    redirectAnchor: 'appearance',
    isUnrestricted: true,
  })
})
