import { Role } from '../../../../../server/data/enums/role'
import EditPage from '../../../../pages/editPages/editPage'
import { editPageTests } from '../editPageTests'
import { CorePersonRecordReferenceDataDomain } from '../../../../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { PersonalRelationshipsReferenceDataDomain } from '../../../../../server/data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

context('Add UK Address', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  before(() => {
    cy.refreshReferenceData(PersonalRelationshipsReferenceDataDomain.City)
    cy.refreshReferenceData(CorePersonRecordReferenceDataDomain.county)
    cy.refreshReferenceData(CorePersonRecordReferenceDataDomain.country)
  })

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
      cy.task('stubPersonalRelationshipsGetReferenceData', {
        domain: 'CITY',
        referenceData: [{ code: 'CITY1', description: 'My Post Town', isActive: true }],
      })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'COUNTY',
        referenceData: [{ code: 'COUNTY1', description: 'My County', isActive: true }],
      })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'COUNTRY',
        referenceData: [{ code: 'ENG', description: 'England', isActive: true }],
      })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/add-uk-address`,
    editPageWithTitle: EditPage,
    editPageTitle: `Add a UK address for John Saunders`,
    validInputs: [
      { autocompleteInputs: { country: 'England' } },
      {
        textInputs: {
          houseOrBuildingName: 'House Or Building Name',
          houseNumber: '123',
          addressLine1: 'Address Line 1',
          addressLine2: 'Address Line 2',
          postcode: 'SW1H 9AJ',
        },
        autocompleteInputs: {
          'town-or-city': 'My Post Town',
          county: 'My County',
          country: 'England',
        },
      },
    ],
    invalidInputs: [
      {
        testDescription: 'Nothing selected',
        input: {},
        errorMessages: ['Enter a country'],
      },
      {
        testDescription: 'Character counts exceeded',
        input: {
          textInputs: {
            houseOrBuildingName: 'a'.repeat(51),
            houseNumber: '1'.repeat(5),
            addressLine1: 'a'.repeat(61),
            addressLine2: 'a'.repeat(36),
            postcode: 'abc',
          },
        },
        errorMessages: [
          'House or building name must be 50 characters or less',
          'House number must be 4 characters or less',
          'Address line 1 must be 60 characters or less',
          'Address line 2 must be 35 characters or less',
          'Enter a full UK postcode',
        ],
      },
      {
        testDescription: 'Invalid selection from autocomplete',
        input: {
          autocompleteInputs: {
            'town-or-city': 'wrong city',
            county: 'wrong county',
            country: 'wrong country',
          },
        },
        errorMessages: ['Enter a valid town or city', 'Enter a valid county', 'Enter a valid country'],
      },
    ],
    redirectUrl: '/prisoner/G6123VU/personal/confirm-address',
  })
})
