import { Role } from '../../../../server/data/enums/role'
import EditWeight from '../../../pages/editPages/weight'
import { editPageTests } from './editPageTests'

context('Edit height (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  editPageTests<EditWeight>({
    prisonerNumber,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [
          {
            caseLoadId: 'MDI',
            currentlyActive: true,
            description: '',
            type: '',
            caseloadFunction: '',
          },
        ],
        roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'],
      })
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/weight`,
    validInputs: { textInputs: { editField: '65' } },
    invalidResponses: [
      {
        testDescription: 'Empty',
        inputs: { textInputs: { editField: '' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Negative number',
        inputs: { textInputs: { editField: '-10' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Zero',
        inputs: { textInputs: { editField: '0' } },
        errorMessages: ['Enter a number greater than 0'],
      },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Edit weight',
    successfulFlashMessage: 'Weight edited',
  })
})

context('Edit weight (Imperial)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  editPageTests<EditWeight>({
    prisonerNumber,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [
          {
            caseLoadId: 'MDI',
            currentlyActive: true,
            description: '',
            type: '',
            caseloadFunction: '',
          },
        ],
        roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'],
      })
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/weight/imperial`,
    validInputs: { textInputs: { stones: '5', pounds: '3' } },
    invalidResponses: [
      // {
      //   testDescription: 'Feet: Empty',
      //   inputs: { textInputs: { feet: '', inches: '5' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
      // {
      //   testDescription: 'Feet: Negative number',
      //   inputs: { textInputs: { feet: '-1', inches: '5' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
      // {
      //   testDescription: 'Feet: Zero',
      //   inputs: { textInputs: { feet: '0', inches: '5' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
      // {
      //   testDescription: 'Inches: Empty',
      //   inputs: { textInputs: { feet: '5', inches: '' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
      // {
      //   testDescription: 'Inches: Negative number',
      //   inputs: { textInputs: { feet: '5', inches: '-1' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
      // {
      //   testDescription: 'Inches: Zero',
      //   inputs: { textInputs: { feet: '5', inches: '0' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
      // {
      //   testDescription: 'No input',
      //   inputs: { textInputs: { feet: '', inches: '' } },
      //   errorMessages: ['Enter a number greater than 0'],
      // },
    ],
    editPageWithTitle: EditWeight,
    editPageTitle: 'Edit weight',
    successfulFlashMessage: 'Weight edited',
  })
})
