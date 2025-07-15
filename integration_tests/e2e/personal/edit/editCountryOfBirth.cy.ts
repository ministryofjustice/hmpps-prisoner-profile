import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { CountryReferenceDataCodesMock } from '../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

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
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonIntegrationUpdate', { prisonerNumber })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'COUNTRY',
        referenceData: CountryReferenceDataCodesMock,
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/country-of-birth`,
    editPageWithTitle: EditPage,
    editPageTitle: 'What country was John Saunders born in?',
    successfulFlashMessage: 'Country of birth updated',
    validInputs: [
      { radioInputs: { radioField: 'ENG' } },
      {
        radioInputs: { radioField: 'OTHER' },
        autocompleteInputs: { autocomplete: 'France' },
      },
    ],
    invalidInputs: [
      {
        testDescription: 'Empty autocomplete field',
        input: {
          radioInputs: { radioField: 'OTHER' },
          autocompleteInputs: { autocomplete: '' },
        },
        errorMessages: ['Enter country name'],
      },
      {
        testDescription: 'Blank autocomplete field',
        input: {
          radioInputs: { radioField: 'OTHER' },
          autocompleteInputs: { autocomplete: '   ' },
        },
        errorMessages: ['Enter country name'],
      },
      {
        testDescription: 'Invalid autocomplete field',
        input: {
          radioInputs: { radioField: 'OTHER' },
          autocompleteInputs: { autocomplete: 'invalid' },
        },
        errorMessages: ['This is not a valid country'],
      },
    ],
    redirectAnchor: 'personal-details',
  })
})
