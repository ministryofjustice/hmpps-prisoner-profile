import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { LanguageRefDataMock } from '../../../../server/data/localMockData/personCommunicationNeedsApiRefDataMock'

context('Edit main language', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  context('Prisoner with existing language preferences', () => {
    editPageTests<EditPage>({
      prisonerNumber,
      prisonerName,
      bookingId,
      testSetup: () => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupComponentsData()
        cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonalCareNeeds')
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
        cy.task('stubPersonCommunicationNeedsUpdateLanguagePreferences', { prisonerNumber })
        cy.task('stubPersonCommunicationNeedsGetReferenceData', {
          domain: 'LANG',
          referenceData: LanguageRefDataMock.language,
        })
      },
      editUrl: `prisoner/${prisonerNumber}/personal/main-language`,
      editPageWithTitle: EditPage,
      editPageTitle: 'Main language',
      successfulFlashMessage: 'Languages updated',
      validInputs: [
        {
          radioInputs: { interpreterRequired: 'false' },
        },
        {
          radioInputs: { interpreterRequired: 'true' },
        },
        {
          radioInputs: { interpreterRequired: 'false' },
          autocompleteInputs: {
            preferredSpokenLanguageCode: 'French', // Note: Using `description` for the test as entering into AutoComplete field
            preferredWrittenLanguageCode: 'English',
          },
        },
        {
          radioInputs: { interpreterRequired: 'true' },
          autocompleteInputs: {
            preferredSpokenLanguageCode: 'English',
            preferredWrittenLanguageCode: 'French',
          },
        },
      ],
      invalidInputs: [
        {
          testDescription: 'Same language as secondary language',
          input: {
            radioInputs: { interpreterRequired: 'false' },
            autocompleteInputs: {
              preferredSpokenLanguageCode: 'Spanish',
            },
          },
          errorMessages: ['Language must be different from the saved languages'],
        },
        {
          testDescription: 'Invalid spoken language',
          input: {
            radioInputs: { interpreterRequired: 'false' },
            autocompleteInputs: {
              preferredSpokenLanguageCode: 'Klingon',
            },
          },
          errorMessages: ['This is not a valid language'],
        },
        {
          testDescription: 'Invalid written language',
          input: {
            radioInputs: { interpreterRequired: 'false' },
            autocompleteInputs: {
              preferredWrittenLanguageCode: 'Klingon',
            },
          },
          errorMessages: ['This is not a valid language'],
        },
      ],
      redirectAnchor: 'main-language',
      isUnrestricted: true,
    })
  })

  context('Prisoner without existing language preferences', () => {
    editPageTests<EditPage>({
      prisonerNumber,
      prisonerName,
      bookingId,
      testSetup: () => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupComponentsData()
        cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonalCareNeeds')
        cy.task('stubPersonCommunicationNeedsGetCommunicationNeeds', {
          prisonerNumber,
          languagePreferences: {},
          secondaryLanguages: [],
        })
        cy.task('stubPersonCommunicationNeedsUpdateLanguagePreferences', { prisonerNumber })
        cy.task('stubPersonCommunicationNeedsGetReferenceData', {
          domain: 'LANG',
          referenceData: LanguageRefDataMock.language,
        })
      },
      editUrl: `prisoner/${prisonerNumber}/personal/main-language`,
      editPageWithTitle: EditPage,
      editPageTitle: 'Main language',
      successfulFlashMessage: 'Languages updated',
      validInputs: [
        {
          radioInputs: { interpreterRequired: 'false' },
        },
        {
          radioInputs: { interpreterRequired: 'true' },
        },
        {
          radioInputs: { interpreterRequired: 'false' },
          autocompleteInputs: {
            preferredSpokenLanguageCode: 'French',
            preferredWrittenLanguageCode: 'English',
          },
        },
        {
          radioInputs: { interpreterRequired: 'true' },
          autocompleteInputs: {
            preferredSpokenLanguageCode: 'English',
            preferredWrittenLanguageCode: 'French',
          },
        },
      ],
      invalidInputs: [
        {
          testDescription: 'Invalid interpreter required',
          input: {
            // Don't set interpreterRequired
            autocompleteInputs: {
              preferredSpokenLanguageCode: 'English',
              preferredWrittenLanguageCode: 'French',
            },
          },
          errorMessages: ['Select if an interpreter is required'],
        },
        {
          testDescription: 'Invalid spoken language',
          input: {
            radioInputs: { interpreterRequired: 'false' },
            autocompleteInputs: {
              preferredSpokenLanguageCode: 'Klingon',
            },
          },
          errorMessages: ['This is not a valid language'],
        },
        {
          testDescription: 'Invalid written language',
          input: {
            radioInputs: { interpreterRequired: 'false' },
            autocompleteInputs: {
              preferredWrittenLanguageCode: 'Klingon',
            },
          },
          errorMessages: ['This is not a valid language'],
        },
      ],
      redirectAnchor: 'main-language',
      isUnrestricted: true,
    })
  })
})
