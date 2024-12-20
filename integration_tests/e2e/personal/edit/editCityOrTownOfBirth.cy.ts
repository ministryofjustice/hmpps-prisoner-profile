import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'

context('Edit city or town of birth', () => {
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
      cy.task('stubPersonIntegrationUpdateBirthPlace', { prisonerNumber })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/city-or-town-of-birth`,
    editPageWithTitle: EditPage,
    editPageTitle: 'City or town of birth',
    successfulFlashMessage: 'City or town of birth updated',
    validInputs: { textInputs: { cityOrTownOfBirth: 'SHEFFIELD' } },
    invalidResponses: [],
    redirectAnchor: 'personal-details',
  })
})
