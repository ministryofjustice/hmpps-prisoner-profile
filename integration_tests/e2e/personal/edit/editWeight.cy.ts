import { Role } from '../../../../server/data/enums/role'
import EditWeight from '../../../pages/editPages/weight'
import { editPageTests } from './editPageTests'

context('Edit Weight (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditWeight>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/weight`,
    validInputs: [{ textInputs: { kilograms: '65' } }],
    invalidInputs: [
      {
        testDescription: 'Negative number',
        input: { textInputs: { kilograms: '-10' } },
        errorMessages: ['Weight must be between 12 kilograms and 640 kilograms'],
      },
      {
        testDescription: 'Zero',
        input: { textInputs: { kilograms: '0' } },
        errorMessages: ['Weight must be between 12 kilograms and 640 kilograms'],
      },
      {
        testDescription: 'Invalid',
        input: { textInputs: { kilograms: 'Example' } },
        errorMessages: ['Enter this person’s weight'],
      },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Weight',
    successfulFlashMessage: 'Weight updated',
    redirectAnchor: 'appearance',
    isUnrestricted: true,
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
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/weight/imperial`,
    validInputs: [{ textInputs: { stone: '5', pounds: '3' } }],
    invalidInputs: [
      {
        testDescription: 'Invalid',
        input: { textInputs: { stone: 'Example', pounds: '5' } },
        errorMessages: ['Enter this person’s weight'],
      },
      {
        testDescription: 'Invalid',
        input: { textInputs: { stone: '5', pounds: 'Example' } },
        errorMessages: ['Enter this person’s weight'],
      },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Weight',
    successfulFlashMessage: 'Weight updated',
    redirectAnchor: 'appearance',
    isUnrestricted: true,
  })
})
