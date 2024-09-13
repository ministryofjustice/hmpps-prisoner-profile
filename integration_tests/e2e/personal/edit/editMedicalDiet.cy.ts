import { Role } from '../../../../server/data/enums/role'
import {
  referenceDataDomainMock,
  referenceDataDomainsMock,
  smokerCodesMock,
} from '../../../../server/data/localMockData/prisonPersonApi/referenceDataMocks'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'

context('Edit medical diet', () => {
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
      cy.task('stubPrisonPersonUpdateHealth', { prisonerNumber })
      cy.setupPersonRefDataStubs({
        domainsResp: referenceDataDomainsMock,
        domainResp: referenceDataDomainMock,
        codesResp: smokerCodesMock,
        codeResp: smokerCodesMock[0],
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/medical-diet`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Medical diet',
    successfulFlashMessage: 'Medical diet updated',
    validInputs: {
      checkboxInputs: { medicalDiet: [{ value: 'FREE_FROM', subvalues: ['LACTOSE', 'CHEESE'] }, 'LOW_FAT'] },
    },
    redirectAnchor: 'personal-details',
  })
})
