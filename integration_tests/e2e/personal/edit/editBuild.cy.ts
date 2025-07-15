import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { buildCodesMock } from '../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

context('Edit build', () => {
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
        domain: 'BUILD',
        referenceData: buildCodesMock,
      })
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/build`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Build',
    successfulFlashMessage: 'Build updated',
    validInputs: [{ radioInputs: { radioField: 'MEDIUM' } }],
    redirectAnchor: 'appearance',
    isUnrestricted: true,
  })
})
