import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { mockMedicalDietReferenceDataDomain } from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'
import {
  foodAllergyCodesMock,
  medicalDietCodesMock,
  personalisedDietCodesMock,
} from '../../../../server/data/localMockData/healthAndMedicationApi/referenceDataMocks'

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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DietAndAllergiesEdit] })
      cy.setupComponentsData()
      cy.setupHealthAndMedicationRefDataStubs({
        foodAllergies: foodAllergyCodesMock,
        medicalDiets: medicalDietCodesMock,
        personalisedDiets: personalisedDietCodesMock,
      })
      cy.task('stubHealthAndMedication', { prisonerNumber })
      cy.task('stubDietAndAllergyUpdate', { prisonerNumber })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubGetReferenceDataDomain', mockMedicalDietReferenceDataDomain)
    },
    editUrl: `prisoner/${prisonerNumber}/personal/diet-and-food-allergies`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Diet and food allergies',
    successfulFlashMessage: 'Diet and food allergies updated',
    validInputs: [
      {
        checkboxInputs: {
          '"medical[0][value]"': ['MEDICAL_DIET_COELIAC'],
          '"allergy[0][value]"': ['FOOD_ALLERGY_EGG'],
          '"personalised[0][value]"': ['PERSONALISED_DIET_VEGAN'],
        },
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
