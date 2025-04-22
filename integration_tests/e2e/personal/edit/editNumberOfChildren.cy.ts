import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { PersonalRelationshipsNumberOfChildrenMock } from '../../../../server/data/localMockData/personalRelationshipsApiMock'

context('Edit number of children', () => {
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
      cy.task('stubPersonalRelationshipsUpdateNumberOfChildren', {
        prisonerNumber,
        resp: PersonalRelationshipsNumberOfChildrenMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/children`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Does John Saunders have any children?',
    successfulFlashMessage: 'Children updated',
    validInputs: [
      { radioInputs: { hasChildren: 'NO' } },
      { radioInputs: { hasChildren: 'YES' }, textInputs: { numberOfChildren: '4' } },
    ],
    invalidInputs: [
      {
        testDescription: 'Number of children not specified',
        input: { radioInputs: { hasChildren: 'YES' }, textInputs: { numberOfChildren: '' } },
        errorMessages: [`Enter the number of children.`],
      },
      {
        testDescription: 'Negative number of children',
        input: { radioInputs: { hasChildren: 'YES' }, textInputs: { numberOfChildren: '-1' } },
        errorMessages: [`Enter the number of children.`],
      },
      {
        testDescription: 'Non-integer number of children',
        input: { radioInputs: { hasChildren: 'YES' }, textInputs: { numberOfChildren: '2.5' } },
        errorMessages: [`Enter the number of children.`],
      },
      {
        testDescription: 'Non-numeric value provided for number of children',
        input: { radioInputs: { hasChildren: 'YES' }, textInputs: { numberOfChildren: 'Zwei' } },
        errorMessages: [`Enter the number of children.`],
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
