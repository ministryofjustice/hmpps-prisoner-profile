import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { mockFoodAllergiesReferenceDataDomain } from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'

context('Edit medical diet', () => {
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
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPrisonPersonUpdateHealth', { prisonerNumber })
      cy.task('stubGetReferenceDataDomain', mockFoodAllergiesReferenceDataDomain)
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/food-allergies`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Does John Saunders have any food allergies?',
    successfulFlashMessage: 'Food allergies updated',
    validInputs: [
      {
        checkboxInputs: { foodAllergies: ['FOOD_ALLERGY_EGG', 'FOOD_ALLERGY_GLUTEN'] },
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
