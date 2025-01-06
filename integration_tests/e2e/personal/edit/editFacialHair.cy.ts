import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import {
  facialHairCodesMock,
  referenceDataDomainMock,
  referenceDataDomainsMock,
} from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'

context('Edit facial hair', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.setupPersonRefDataStubs({
        domainsResp: referenceDataDomainsMock,
        domainResp: referenceDataDomainMock,
        codesResp: facialHairCodesMock,
        codeResp: facialHairCodesMock[0],
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/facial-hair`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Facial hair',
    successfulFlashMessage: 'Facial hair updated',
    validInputs: [{ radioInputs: { radioField: 'FACIAL_HAIR_BEARDED' } }],
    redirectAnchor: 'appearance',
  })
})
