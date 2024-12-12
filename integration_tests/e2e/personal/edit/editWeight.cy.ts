import { Role } from '../../../../server/data/enums/role'
import EditWeight from '../../../pages/editPages/weight'
import { editPageTests } from './editPageTests'

context('Edit height (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditWeight>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/weight`,
    validInputs: { textInputs: { kilograms: '65' } },
    invalidResponses: [
      {
        testDescription: 'Negative number',
        inputs: { textInputs: { kilograms: '-10' } },
        errorMessages: ['Weight must be between 12 kilograms and 640 kilograms'],
      },
      {
        testDescription: 'Zero',
        inputs: { textInputs: { kilograms: '0' } },
        errorMessages: ['Weight must be between 12 kilograms and 640 kilograms'],
      },
      {
        testDescription: 'Invalid',
        inputs: { textInputs: { kilograms: 'Example' } },
        errorMessages: ["Enter this person's weight"],
      },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Weight',
    successfulFlashMessage: 'Weight edited',
    redirectAnchor: 'appearance',
  })
})

context('Edit weight (Imperial)', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditWeight>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/weight/imperial`,
    validInputs: { textInputs: { stone: '5', pounds: '3' } },
    invalidResponses: [
      {
        testDescription: 'Invalid',
        inputs: { textInputs: { stone: 'Example', pounds: '5' } },
        errorMessages: ["Enter this person's weight"],
      },
      {
        testDescription: 'Invalid',
        inputs: { textInputs: { stone: '5', pounds: 'Example' } },
        errorMessages: ["Enter this person's weight"],
      },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Weight',
    successfulFlashMessage: 'Weight edited',
    redirectAnchor: 'appearance',
  })
})
