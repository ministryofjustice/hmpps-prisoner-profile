import { HealthAndMedication } from '../../../../server/data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import PersonalPage from '../../../pages/personalPage'
import EditPage from '../../../pages/editPages/editPage'
import {
  foodAllergyCodesMock,
  medicalDietCodesMock,
  personalisedDietCodesMock,
} from '../../../../server/data/localMockData/healthAndMedicationApi/referenceDataMocks'

context('Edit diet and food allergies', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  const lastModifiedMetadata = {
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
    lastModifiedPrisonId: 'STI',
  }

  const dietAndAllergyA = {
    foodAllergies: { value: [], ...lastModifiedMetadata },
    medicalDietaryRequirements: { value: [], ...lastModifiedMetadata },
    personalisedDietaryRequirements: {
      value: [{ value: { id: 'PERSONALISED_DIET_VEGAN', code: 'VEGAN', description: 'Vegan' } }],
      ...lastModifiedMetadata,
    },
    cateringInstructions: { value: '', ...lastModifiedMetadata },
  }

  const pendingMerges = [
    {
      dietAndAllergy: {
        foodAllergies: {
          value: [{ value: { id: 'FOOD_ALLERGY_EGG', code: 'EGG', description: 'Egg' } }],
          ...lastModifiedMetadata,
        },
        medicalDietaryRequirements: {
          value: [{ value: { id: 'MEDICAL_DIET_DIABETES_1', code: 'DIABETES_1', description: 'Diabetes 1' } }],
          ...lastModifiedMetadata,
        },
        personalisedDietaryRequirements: { value: [], ...lastModifiedMetadata },
        cateringInstructions: { value: 'Catering instructions from B', ...lastModifiedMetadata },
      },
      pendingMerges: [],
    },
    {
      dietAndAllergy: {
        foodAllergies: {
          value: [{ value: { id: 'FOOD_ALLERGY_EGG', code: 'EGG', description: 'Egg' } }],
          ...lastModifiedMetadata,
        },
        medicalDietaryRequirements: {
          value: [{ value: { id: 'MEDICAL_DIET_DIABETES_2', code: 'DIABETES_2', description: 'Diabetes 2' } }],
          ...lastModifiedMetadata,
        },
        personalisedDietaryRequirements: { value: [], ...lastModifiedMetadata },
        cateringInstructions: { value: 'Catering instructions from C', ...lastModifiedMetadata },
      },
      pendingMerges: [],
    },
  ]

  const updatedDietAndAllergyA = {
    ...dietAndAllergyA,
    foodAllergies: {
      value: [{ value: { id: 'FOOD_ALLERGY_EGG', code: 'EGG', description: 'Egg' } }],
      ...lastModifiedMetadata,
    },
  }

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DietAndAllergiesEdit] })
    cy.setupComponentsData()
    cy.setupHealthAndMedicationRefDataStubs({
      foodAllergies: foodAllergyCodesMock,
      medicalDiets: medicalDietCodesMock,
      personalisedDiets: personalisedDietCodesMock,
    })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    cy.task('stubDietAndAllergyUpdate', { prisonerNumber })
  })

  const setupInitialState = (pendingMergesOverride: HealthAndMedication[] = []) => {
    cy.task('stubHealthAndMedication', {
      prisonerNumber,
      overrides: { dietAndAllergy: dietAndAllergyA, pendingMerges: pendingMergesOverride },
    })
    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/personal/diet-and-food-allergies` })
    return new EditPage('Diet and food allergies')
  }

  const verifyUpdatedAndOnProfilePage = () => {
    cy.url().should('include', `/prisoner/${prisonerNumber}/personal`)
    const personalPage = Page.verifyOnPage(PersonalPage)
    personalPage.personalDetails().dietAndFoodAllergies().should('include.text', 'Egg')
  }

  it('Should update ordinarily when there are no pending merges to review', () => {
    const editPage = setupInitialState()
    editPage.selectCheckboxes({ '"allergy[0][value]"': ['FOOD_ALLERGY_EGG'] })

    cy.task('stubHealthAndMedication', {
      prisonerNumber,
      overrides: { dietAndAllergy: updatedDietAndAllergyA, pendingMerges: [] },
    })
    editPage.submit()
    verifyUpdatedAndOnProfilePage()
  })

  for (const reviewStatus of ['INCOMPLETE', 'NOT_STARTED']) {
    it(`Should update whilst retaining pending merge data when merge review is marked ${reviewStatus.toLowerCase().replace('_', ' ')}`, () => {
      const editPage = setupInitialState(pendingMerges)
      cy.get('.moj-alert--warning').should('exist')
      cy.get('.diet-and-food-allergies-additional-info').contains('Diabetes 1')

      editPage.selectCheckboxes({ '"allergy[0][value]"': ['FOOD_ALLERGY_EGG'] })
      editPage.selectRadios({ reviewStatus })

      cy.task('stubHealthAndMedication', {
        prisonerNumber,
        overrides: { dietAndAllergy: updatedDietAndAllergyA, pendingMerges },
      })
      editPage.submit()
      verifyUpdatedAndOnProfilePage()

      cy.visit(`/prisoner/${prisonerNumber}/personal/diet-and-food-allergies`)
      cy.get('.moj-alert--warning').should('exist')
    })
  }

  it('Should update without retaining pending merge data when merge review is marked complete', () => {
    cy.task('stubCompleteMerge', { prisonerNumber })
    const editPage = setupInitialState(pendingMerges)

    editPage.selectCheckboxes({ '"allergy[0][value]"': ['FOOD_ALLERGY_EGG'] })
    editPage.selectRadios({ reviewStatus: 'COMPLETE' })

    cy.task('stubHealthAndMedication', {
      prisonerNumber,
      overrides: { dietAndAllergy: updatedDietAndAllergyA, pendingMerges: [] },
    })
    editPage.submit()
    verifyUpdatedAndOnProfilePage()

    cy.visit(`/prisoner/${prisonerNumber}/personal/diet-and-food-allergies`)
    cy.get('.moj-alert--warning').should('not.exist')
  })
})
