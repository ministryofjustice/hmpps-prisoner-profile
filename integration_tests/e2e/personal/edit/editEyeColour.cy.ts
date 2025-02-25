import { Role } from '../../../../server/data/enums/role'
import { editPageTests } from './editPageTests'
import { eyeColourCodesMock } from '../../../../server/data/localMockData/personIntegrationApi/referenceDataMocks'
import EditEyeColour from '../../../pages/editPages/eyeColour'
import Page from '../../../pages/page'

context('Edit eye colour - both eyes the same colour', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditEyeColour>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'L_EYE_C',
        referenceData: eyeColourCodesMock,
      })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'R_EYE_C',
        referenceData: eyeColourCodesMock,
      })
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/eye-colour`,
    editPageWithTitle: EditEyeColour,
    editPageTitle: 'Eye colour',
    successfulFlashMessage: 'Eye colour updated',
    validInputs: [{ radioInputs: { eyeColour: 'BLUE' } }],
    redirectAnchor: 'appearance',
  })
})

context('Edit eye colour - left and right eyes different colours', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditEyeColour>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'L_EYE_C',
        referenceData: eyeColourCodesMock,
      })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'R_EYE_C',
        referenceData: eyeColourCodesMock,
      })
      cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/eye-colour-individual`,
    editPageWithTitle: EditEyeColour,
    editPageTitle: 'Left and right eye colours',
    successfulFlashMessage: 'Left and right eye colours updated',
    validInputs: [{ radioInputs: { leftEyeColour: 'BROWN', rightEyeColour: 'HAZEL' } }],
    redirectAnchor: 'appearance',
  })
})

context('Edit eye colour - switch between using one or two sets of radios', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484
  let page: EditEyeColour

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
    cy.setupComponentsData()
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    cy.task('stubPersonalCareNeeds')
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'L_EYE_C',
      referenceData: eyeColourCodesMock,
    })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'R_EYE_C',
      referenceData: eyeColourCodesMock,
    })
    cy.task('stubPersonIntegrationUpdatePhysicalAttributes')
    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/personal/edit/eye-colour` })
  })

  it('Can switch between the eye colour edit pages', () => {
    page = Page.verifyOnPageWithTitle(EditEyeColour, 'Eye colour')

    page.switchEntryType()

    page = Page.verifyOnPageWithTitle(EditEyeColour, 'Left and right eye colour')

    page.switchEntryType()

    page = Page.verifyOnPageWithTitle(EditEyeColour, 'Eye colour')
  })
})
