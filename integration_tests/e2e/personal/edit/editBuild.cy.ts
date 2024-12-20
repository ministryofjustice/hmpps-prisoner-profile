import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import {
  buildCodesMock,
  referenceDataDomainMock,
  referenceDataDomainsMock,
} from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'

context('Edit build', () => {
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
        codesResp: buildCodesMock,
        codeResp: buildCodesMock[0],
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/build`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Build',
    successfulFlashMessage: 'Build updated',
    validInputs: { radioInputs: { radioField: 'BUILD_PROP' } },
    redirectAnchor: 'appearance',
  })
})
