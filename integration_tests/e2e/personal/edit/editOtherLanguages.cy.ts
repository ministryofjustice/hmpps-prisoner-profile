import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { LanguageRefDataMock } from '../../../../server/data/localMockData/personCommunicationNeedsApiRefDataMock'

context('Edit other languages', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  context('Prisoner with existing other languages', () => {
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
        cy.task('stubAllPersonalCareNeeds')
        cy.task('stubPersonCommunicationNeedsGetCommunicationNeeds', {
          prisonerNumber,
          languagePreferences: {
            preferredSpokenLanguage: { code: 'ENG', description: 'English' },
            preferredWrittenLanguage: { code: 'ENG', description: 'English' },
            interpreterRequired: false,
          },
          secondaryLanguages: [
            {
              language: { code: 'SPA', description: 'Spanish' },
              canRead: true,
              canWrite: false,
              canSpeak: true,
            },
          ],
        })
        cy.task('stubPersonCommunicationNeedsUpdateSecondaryLanguage', { prisonerNumber })
        cy.task('stubPersonCommunicationNeedsGetReferenceData', {
          domain: 'LANG',
          referenceData: LanguageRefDataMock.language,
        })
      },
      editUrl: `prisoner/${prisonerNumber}/personal/other-languages`,
      editPageWithTitle: EditPage,
      editPageTitle: 'Other languages',
      successfulFlashMessage: 'Languages updated',
      validInputs: [
        {
          namedAutocompleteInputs: {
            language: 'French', // Note: Using `description` for the test as entering into AutoComplete field
          },
          checkboxInputs: {
            languageSkills: ['canSpeak', 'canRead'],
          },
        },
      ],
      invalidInputs: [
        {
          testDescription: 'Existing language selected',
          input: {
            namedAutocompleteInputs: {
              language: 'English',
            },
          },
          errorMessages: ['Language must be different from the saved languages'],
        },
        {
          testDescription: 'Invalid language entered',
          input: {
            namedAutocompleteInputs: {
              language: 'Klingon',
            },
          },
          errorMessages: ['This is not a valid language'],
        },
      ],
      redirectAnchor: 'personal-details',
      submitButtonId: 'save-button',
    })
  })

  context('Prisoner without existing other languages', () => {
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
        cy.task('stubAllPersonalCareNeeds')
        cy.task('stubPersonCommunicationNeedsGetCommunicationNeeds', {
          prisonerNumber,
          languagePreferences: {},
          secondaryLanguages: [],
        })
        cy.task('stubPersonCommunicationNeedsUpdateSecondaryLanguage', { prisonerNumber })
        cy.task('stubPersonCommunicationNeedsDeleteSecondaryLanguage', { prisonerNumber })
        cy.task('stubPersonCommunicationNeedsGetReferenceData', {
          domain: 'LANG',
          referenceData: LanguageRefDataMock.language,
        })
      },
      editUrl: `prisoner/${prisonerNumber}/personal/other-languages`,
      editPageWithTitle: EditPage,
      editPageTitle: 'Other languages',
      successfulFlashMessage: 'Languages updated',
      validInputs: [
        {
          namedAutocompleteInputs: {
            language: 'French',
          },
          checkboxInputs: {
            languageSkills: ['canSpeak', 'canRead'],
          },
        },
      ],
      invalidInputs: [
        {
          testDescription: 'Invalid language entered',
          input: {
            namedAutocompleteInputs: {
              language: 'Klingon',
            },
          },
          errorMessages: ['This is not a valid language'],
        },
      ],
      redirectAnchor: 'personal-details',
      submitButtonId: 'save-button',
    })
  })
})
