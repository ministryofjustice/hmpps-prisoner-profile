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
        errorMessages: ['Weight must only contain numbers'],
      },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Weight',
    successfulFlashMessage: 'Weight updated',
    redirectAnchor: 'weight',
    isUnrestricted: true,
  })
})

context('Edit weight (Imperial)', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  context('Stone and pounds', () => {
    const stoneAndPounds = { imperialWeightOption: 'stoneAndPounds' }

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
      validInputs: [{ radioInputs: stoneAndPounds, textInputs: { stone: '5', pounds: '3' } }],
      invalidInputs: [
        {
          testDescription: 'Non numeric stone value',
          input: { radioInputs: stoneAndPounds, textInputs: { stone: 'Example', pounds: '5' } },
          errorMessages: ['Weight must only contain numbers'],
        },
        {
          testDescription: 'Non numeric pounds value',
          input: { radioInputs: stoneAndPounds, textInputs: { stone: '5', pounds: 'Example' } },
          errorMessages: ['Weight must only contain numbers'],
        },
      ],
      editPageWithTitle: EditWeight,
      editPageTitle: 'Weight',
      successfulFlashMessage: 'Weight updated',
      redirectAnchor: 'weight',
      isUnrestricted: true,
    })
  })

  context('Pounds only', () => {
    const poundsOnly = { imperialWeightOption: 'poundsOnly' }

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
      validInputs: [{ radioInputs: poundsOnly, textInputs: { poundsOnly: '150' } }],
      invalidInputs: [
        {
          testDescription: 'Non numeric pounds value',
          input: { radioInputs: poundsOnly, textInputs: { poundsOnly: 'Example' } },
          errorMessages: ['Weight must only contain numbers'],
        },
        {
          testDescription: 'Value outside acceptable range',
          input: { radioInputs: poundsOnly, textInputs: { poundsOnly: '1401' } },
          errorMessages: ['Weight must be between 28 and 1400 pounds'],
        },
      ],
      editPageWithTitle: EditWeight,
      editPageTitle: 'Weight',
      successfulFlashMessage: 'Weight updated',
      redirectAnchor: 'weight',
      isUnrestricted: true,
    })
  })
})
