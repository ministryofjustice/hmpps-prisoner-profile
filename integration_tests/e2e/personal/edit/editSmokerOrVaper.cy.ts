import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { smokerStatusCodesMock } from '../../../../server/data/localMockData/healthAndMedicationApi/referenceDataMocks'

context('Edit smoker or vaper', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditPage>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubSmokerStatusUpdate', { prisonerNumber })

      cy.setupHealthAndMedicationRefDataStubs({ smokerCodes: smokerStatusCodesMock })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/smoker-or-vaper`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Does John Saunders smoke or vape?',
    successfulFlashMessage: 'Smoking and vaping updated',
    validInputs: [{ radioInputs: { radioField: 'SMOKER_YES ' } }],
    redirectAnchor: 'smoking-and-vaping',
    isUnrestricted: true,
  })
})
