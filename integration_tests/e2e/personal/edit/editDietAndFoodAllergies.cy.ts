import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { mockMedicalDietReferenceDataDomain } from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'

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
      cy.task('stubHealthAndMedication', { prisonerNumber })
      cy.task('stubHealthAndMedicationUpdate', { prisonerNumber })
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
          medical: ['MEDICAL_DIET_COELIAC'],
          allergies: ['FOOD_ALLERGY_EGG'],
          personal: [
            { value: 'PERSONAL_DIET_OTHER', conditionals: { textInputs: { personalOther: 'Some other text' } } },
          ],
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: 'Medical diet other: No text',
        input: { checkboxInputs: { medical: ['MEDICAL_DIET_OTHER'] } },
        errorMessages: ['Enter the other medical dietary requirements.'],
      },
      {
        testDescription: 'Food allergies other: No text',
        input: { checkboxInputs: { allergies: ['FOOD_ALLERGY_OTHER'] } },
        errorMessages: ['Enter the other food allergies.'],
      },
      {
        testDescription: 'Personal diet other: No text',
        input: { checkboxInputs: { personal: ['PERSONAL_DIET_OTHER'] } },
        errorMessages: ['Enter the other personalised dietary requirements.'],
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
