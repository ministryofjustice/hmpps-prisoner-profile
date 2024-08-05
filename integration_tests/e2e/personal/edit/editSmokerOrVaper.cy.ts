import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'

context('Edit smoker or vaper', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditPage>({
    prisonerNumber,
    prisonerName,
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
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/smoker-or-vaper`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Does John Saunders smoke or vape?',
    successfulFlashMessage: 'Smoker or vaper updated',
    validInputs: { radioInputs: { radioField: 'Yes' } },
    redirectAnchor: 'personal-details',
  })
})
