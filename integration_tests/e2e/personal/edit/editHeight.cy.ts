import { Role } from '../../../../server/data/enums/role'
import EditHeight from '../../../pages/editPages/heightImperial'
import { editPageTests } from './editPageTests'

context('Edit height (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditHeight>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/height`,
    validInputs: [{ textInputs: { editField: '125' } }],
    invalidInputs: [
      {
        testDescription: 'Negative number',
        input: { textInputs: { editField: '-10' } },
        errorMessages: ['Height must be between 50 centimetres and 280 centimetres'],
      },
      {
        testDescription: 'Zero',
        input: { textInputs: { editField: '0' } },
        errorMessages: ['Height must be between 50 centimetres and 280 centimetres'],
      },
      {
        testDescription: 'Non-number',
        input: { textInputs: { editField: 'Example' } },
        errorMessages: ["Enter this person's height"],
      },
      {
        testDescription: 'Lower bound',
        input: { textInputs: { editField: '49' } },
        errorMessages: ['Height must be between 50 centimetres and 280 centimetres'],
      },
      {
        testDescription: 'Upper bound',
        input: { textInputs: { editField: '281' } },
        errorMessages: ['Height must be between 50 centimetres and 280 centimetres'],
      },
    ],
    editPageWithTitle: EditHeight,
    editPageTitle: 'Height',
    successfulFlashMessage: 'Height updated',
    redirectAnchor: 'appearance',
  })
})

context('Edit height (Imperial)', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditHeight>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/height/imperial`,
    validInputs: [{ textInputs: { feet: '5', inches: '3' } }],
    invalidInputs: [
      {
        testDescription: 'Feet: Empty',
        input: { textInputs: { feet: '', inches: '5' } },
        errorMessages: ['Feet must be between 1 and 9. Inches must be between 0 and 11'],
      },
      {
        testDescription: 'Inches: Negative number',
        input: { textInputs: { feet: '5', inches: '-1' } },
        errorMessages: ['Feet must be between 1 and 9. Inches must be between 0 and 11'],
      },
    ],
    editPageWithTitle: EditHeight,
    editPageTitle: 'Height',
    successfulFlashMessage: 'Height updated',
    redirectAnchor: 'appearance',
  })
})
