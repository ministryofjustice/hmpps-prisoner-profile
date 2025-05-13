import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
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
      cy.task('stubAllPersonalCareNeeds')
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
        textAreaInputs: {
          cateringInstructions: 'Do not feed after midnight.',
        },
      },
      {
        checkboxInputs: {
          '"medical[0][value]"': ['MEDICAL_DIET_COELIAC'],
          '"medical[1][value]"': ['MEDICAL_DIET_OTHER'],
          '"allergy[1][value]"': ['FOOD_ALLERGY_OTHER'],
          '"personalised[1][value]"': ['PERSONALISED_DIET_OTHER'],
        },
        textAreaInputs: {
          'medical[1][comment]': 'a'.repeat(100),
          'allergy[1][comment]': 'b'.repeat(100),
          'personalised[1][comment]': 'c'.repeat(100),
          cateringInstructions: 'd'.repeat(1000),
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: `Empty 'OTHER' values`,
        input: {
          checkboxInputs: {
            '"medical[1][value]"': ['MEDICAL_DIET_OTHER'],
            '"allergy[1][value]"': ['FOOD_ALLERGY_OTHER'],
            '"personalised[1][value]"': ['PERSONALISED_DIET_OTHER'],
          },
        },
        errorMessages: [
          'Enter the other medical dietary requirements.',
          'Enter the other food allergies.',
          'Enter the other personalised dietary requirements.',
        ],
      },
      {
        testDescription: `Text fields too long`,
        input: {
          checkboxInputs: {
            '"medical[1][value]"': ['MEDICAL_DIET_OTHER'],
            '"allergy[1][value]"': ['FOOD_ALLERGY_OTHER'],
            '"personalised[1][value]"': ['PERSONALISED_DIET_OTHER'],
          },
          textAreaInputs: {
            'medical[1][comment]': 'a'.repeat(101),
            'allergy[1][comment]': 'b'.repeat(101),
            'personalised[1][comment]': 'c'.repeat(101),
            cateringInstructions: 'd'.repeat(1001),
          },
        },
        errorMessages: [
          'The other medical dietary requirements must be 100 characters or less.',
          'The other food allergies must be 100 characters or less.',
          'The other personalised dietary requirements must be 100 characters or less.',
          'The catering instructions must be 1000 characters or less.',
        ],
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
