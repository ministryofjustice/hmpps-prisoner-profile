import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import {
  CityReferenceCodesMock,
  OfficialRelationshipsReferenceCodesMock,
  SocialRelationshipsReferenceCodesMock,
} from '../../../../server/data/localMockData/personalRelationshipsApiMock'
import { PersonalRelationshipsReferenceDataDomain } from '../../../../server/data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

context('Edit next of kin and emergency contacts', () => {
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
      cy.task('stubPersonalRelationshipsGetReferenceData', {
        domain: PersonalRelationshipsReferenceDataDomain.Title,
        referenceData: [
          { code: 'MR', description: 'Mr' },
          { code: 'MRS', description: 'Mrs' },
          { code: 'MS', description: 'Ms' },
          { code: 'DR', description: 'Dr' },
        ],
      })

      cy.task('stubPersonalRelationshipsGetReferenceData', {
        domain: PersonalRelationshipsReferenceDataDomain.SocialRelationship,
        referenceData: SocialRelationshipsReferenceCodesMock,
      })

      cy.task('stubPersonalRelationshipsGetReferenceData', {
        domain: PersonalRelationshipsReferenceDataDomain.OfficialRelationship,
        referenceData: OfficialRelationshipsReferenceCodesMock,
      })

      cy.task('stubPersonalRelationshipsGetReferenceData', {
        domain: PersonalRelationshipsReferenceDataDomain.City,
        referenceData: CityReferenceCodesMock,
      })

      // Stub the create contact endpoint
      cy.task('stubPersonalRelationshipsCreateContact', { prisonerNumber })
    },
    editUrl: `prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`,
    editPageWithTitle: EditPage,
    editPageTitle: 'Add a next of kin or emergency contact',
    successfulFlashMessage: 'Next of kin and emergency contacts added',
    validInputs: [
      {
        // Test case 1: Next of kin only with minimal required fields
        checkboxInputs: { contactType: [{ value: 'nextOfKin' }] },
        textInputs: {
          firstName: 'Jane',
          lastName: 'Doe',
        },
        namedAutocompleteInputs: {
          relationshipTypeId: 'Friend',
        },
      },
      {
        // Test case 2: Emergency contact only with minimal required fields
        checkboxInputs: { contactType: [{ value: 'emergencyContact' }] },
        textInputs: {
          firstName: 'John',
          lastName: 'Smith',
        },
        namedAutocompleteInputs: {
          relationshipTypeId: 'Brother',
        },
      },
      {
        // Test case 3: Both next of kin and emergency contact with all fields
        checkboxInputs: {
          contactType: [{ value: 'nextOfKin' }, { value: 'emergencyContact' }],
          noFixedAddress: [{ value: 'true' }],
        },
        textInputs: {
          firstName: 'Robert',
          middleNames: 'James',
          lastName: 'Johnson',
          'dateOfBirth-day': '15',
          'dateOfBirth-month': '06',
          'dateOfBirth-year': '1980',
          phoneNumber: '07123456789',
          property: '123',
          street: 'Main Street',
          postcode: 'AB12 3CD',
        },
        namedAutocompleteInputs: {
          cityCode: 'London',
          relationshipTypeId: 'Father',
        },
      },
      {
        // Test case 4: No fixed address
        checkboxInputs: {
          contactType: [{ value: 'nextOfKin' }],
          noFixedAddress: [{ value: 'true' }],
        },
        textInputs: {
          firstName: 'Sarah',
          lastName: 'Williams',
        },
        namedAutocompleteInputs: {
          relationshipTypeId: 'Sister',
        },
      },
    ],
    invalidInputs: [
      {
        // Test case 1: Missing contact type
        testDescription: 'Missing contact type',
        input: {
          textInputs: {
            firstName: 'Jane',
            lastName: 'Doe',
          },
          namedAutocompleteInputs: {
            relationshipTypeId: 'Friend',
          },
        },
        errorMessages: ['Select if the contact is a next of kin or an emergency contact'],
      },
      {
        // Test case 2: Missing first name
        testDescription: 'Missing first name',
        input: {
          checkboxInputs: { contactType: [{ value: 'nextOfKin' }] },
          textInputs: {
            lastName: 'Doe',
          },
          namedAutocompleteInputs: {
            relationshipTypeId: 'Friend',
          },
        },
        errorMessages: ['Enter this person’s first name'],
      },
      {
        // Test case 3: Missing last name
        testDescription: 'Missing last name',
        input: {
          checkboxInputs: { contactType: [{ value: 'nextOfKin' }] },
          textInputs: {
            firstName: 'Jane',
          },
          namedAutocompleteInputs: {
            relationshipTypeId: 'Friend',
          },
        },
        errorMessages: ['Enter this person’s last name'],
      },
      {
        // Test case 4: Missing relationship
        testDescription: 'Missing relationship',
        input: {
          checkboxInputs: { contactType: [{ value: 'nextOfKin' }] },
          textInputs: {
            firstName: 'Jane',
            lastName: 'Doe',
          },
        },
        errorMessages: ['Enter relationship'],
      },
      {
        // Test case 5: Invalid relationship
        testDescription: 'INvalid relationship',
        input: {
          checkboxInputs: { contactType: [{ value: 'nextOfKin' }] },
          textInputs: {
            firstName: 'Jane',
            lastName: 'Doe',
          },
          namedAutocompleteInputs: {
            relationshipTypeId: 'Random',
          },
        },
        errorMessages: ['This is not a valid relationship'],
      },
      {
        // Test case 6: Invalid date of birth
        testDescription: 'Invalid date of birth',
        input: {
          checkboxInputs: { contactType: [{ value: 'nextOfKin' }] },
          textInputs: {
            firstName: 'Jane',
            lastName: 'Doe',
            'dateOfBirth-day': '32',
            'dateOfBirth-month': '13',
            'dateOfBirth-year': '2050',
          },
          namedAutocompleteInputs: {
            relationshipTypeId: 'Friend',
          },
        },
        errorMessages: ['Date of birth must be a real date'],
      },
    ],
    redirectAnchor: 'next-of-kin',
    submitButtonId: 'save-button',
  })
})
