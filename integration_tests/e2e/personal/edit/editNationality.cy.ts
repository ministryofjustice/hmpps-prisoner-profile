import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { NationalityReferenceDataCodesMock } from '../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

context('Edit nationality', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  editPageTests<EditPage>({
    prisonerNumber,
    prisonerName,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationNationalityUpdate', { prisonerNumber })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'NAT',
        referenceData: NationalityReferenceDataCodesMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/nationality`,
    editPageWithTitle: EditPage,
    editPageTitle: `Nationality`,
    successfulFlashMessage: 'Nationality updated',
    validInputs: [
      {},
      { radioInputs: { radioField: 'BRIT' } },
      { radioInputs: { radioField: 'BRIT' }, textAreaInputs: { additionalNationalities: 'Dual nationality' } },
      { radioInputs: { radioField: 'OTHER' }, autocompleteInputs: { autocomplete: 'French' } },
      {
        radioInputs: { radioField: 'OTHER' },
        autocompleteInputs: { autocomplete: 'French' },
        textAreaInputs: { additionalNationalities: 'Dual nationality' },
      },
    ],
    invalidInputs: [
      {
        testDescription: 'Other nationality selected but not specified',
        input: { radioInputs: { radioField: 'OTHER' }, autocompleteInputs: { autocomplete: '' } },
        errorMessages: [`Enter nationality`],
      },
      {
        testDescription: 'Invalid nationality entered',
        input: { radioInputs: { radioField: 'OTHER' }, autocompleteInputs: { autocomplete: 'badvalue' } },
        errorMessages: [`This is not a valid nationality`],
      },
      {
        testDescription: 'Other nationality too long',
        input: { radioInputs: { radioField: 'BRIT' }, textAreaInputs: { additionalNationalities: 'a'.repeat(41) } },
        errorMessages: [`Additional nationalities must be 40 characters or less`],
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
