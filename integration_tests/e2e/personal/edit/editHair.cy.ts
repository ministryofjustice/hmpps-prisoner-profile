import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import {
  hairCodesMock,
  referenceDataDomainMock,
  referenceDataDomainsMock,
} from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'

context('Edit hair', () => {
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
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.setupPersonRefDataStubs({
        domainsResp: referenceDataDomainsMock,
        domainResp: referenceDataDomainMock,
        codesResp: hairCodesMock,
        codeResp: hairCodesMock[0],
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/hair`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Hair type or colour',
    successfulFlashMessage: 'Hair type or colour updated',
    validInputs: { radioInputs: { radioField: 'HAIR_BROWN' } },
    redirectAnchor: 'appearance',
  })
})
