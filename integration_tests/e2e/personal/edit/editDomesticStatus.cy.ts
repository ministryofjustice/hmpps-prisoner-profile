import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { PersonalRelationshipsDomesticStatusMock } from '../../../../server/data/localMockData/personalRelationshipsApiMock'

context('Edit domestic status', () => {
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
      cy.task('stubPersonalRelationshipsGetDomesticStatus', {
        prisonerNumber,
        resp: PersonalRelationshipsDomesticStatusMock,
      })
      cy.task('stubPersonalRelationshipsUpdateDomesticStatus', {
        prisonerNumber,
        resp: PersonalRelationshipsDomesticStatusMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/marital-status`,
    editPageWithTitle: EditPage,
    editPageTitle: 'What is John Saunders’ marital or civil partnership status?',
    successfulFlashMessage: 'Marital or civil partnership status updated',
    validInputs: [{ radioInputs: { radioField: 'M' } }],
    redirectAnchor: 'personal-details',
  })
})
