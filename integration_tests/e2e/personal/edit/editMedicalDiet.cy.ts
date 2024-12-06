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
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPrisonPersonUpdateHealth', { prisonerNumber })
      cy.task('stubGetReferenceDataDomain', mockMedicalDietReferenceDataDomain)
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/medical-diet`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Does John Saunders have any of these medical dietary requirements?',
    successfulFlashMessage: 'Medical diet updated',
    validInputs: {
      checkboxInputs: {
        medicalDiet: [
          {
            value: 'MEDICAL_DIET_FREE_FROM',
            subValues: ['FREE_FROM_LACTOSE', 'FREE_FROM_CHEESE'],
          },
          'MEDICAL_DIET_LOW_FAT',
        ],
      },
    },
    redirectAnchor: 'personal-details',
  })
})
