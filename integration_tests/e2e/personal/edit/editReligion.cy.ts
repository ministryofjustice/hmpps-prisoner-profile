import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { ReligionReferenceDataCodesMock } from '../../../../server/data/localMockData/personIntegrationReferenceDataMock'

context('Edit religion, faith or belief', () => {
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
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationReligionUpdate', { prisonerNumber })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'RELF',
        referenceData: ReligionReferenceDataCodesMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/religion`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Religion, faith or belief',
    successfulFlashMessage: 'Religion, faith or belief updated',
    validInputs: [
      { radioInputs: { religion: 'ZORO', reasonKnown: 'NO' } },
      { radioInputs: { religion: 'ZORO', reasonKnown: 'NO' }, textAreaInputs: { reasonForChangeUnknown: 'Some text' } },
      { radioInputs: { religion: 'ZORO', reasonKnown: 'YES' }, textAreaInputs: { reasonForChange: 'Some text' } },
    ],
    invalidInputs: [
      {
        testDescription: 'Nothing selected',
        input: {},
        errorMessages: ['Choose a religion, faith or belief', 'Indicate whether or not the reason for change is known'],
      },
      {
        testDescription: 'No details provided when reason for change is known',
        input: {
          radioInputs: { religion: 'ZORO', reasonKnown: 'YES' },
        },
        errorMessages: ['Provide a reason for the change'],
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
