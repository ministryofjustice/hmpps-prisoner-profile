import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import dpsPages from './integration_tests/mockApis/dpsPages'
import prisonApi from './integration_tests/mockApis/prison'
import nomisSyncPrisonerMappingApi from './integration_tests/mockApis/nomisSyncPrisonerMappingApi'
import locationsInsidePrisonApi from './integration_tests/mockApis/locationsInsidePrisonApi'
import prisonerSearchApi from './integration_tests/mockApis/prisonerSearch'
import pomApi from './integration_tests/mockApis/pom'
import keyWorkerApi from './integration_tests/mockApis/keyWorker'
import educationAndWorkPlanApi from './integration_tests/mockApis/educationAndWorkPlanApi'
import curiousApi from './integration_tests/mockApis/curiousApi'
import caseNotesApi from './integration_tests/mockApis/caseNotesApi'
import incentivesMockApi from './integration_tests/mockApis/incentivesMockApi'
import pathfinderApi from './integration_tests/mockApis/pathfinderApi'
import socApi from './integration_tests/mockApis/socApi'
import adjudicationsApi from './integration_tests/mockApis/adjudications'
import nonAssociationsApi from './integration_tests/mockApis/nonAssociationsApi'
import prisonerProfileDeliusApi from './integration_tests/mockApis/prisonerProfileDeliusApi'
import whereAboutsApi from './integration_tests/mockApis/whereAboutsApi'
import complexityApi from './integration_tests/mockApis/complexityApi'
import restrictedPatientApi from './integration_tests/mockApis/restrictedPatient'
import prisonRegisterApi from './integration_tests/mockApis/prisonRegisterApi'
import calcluateReleaseDatesApi from './integration_tests/mockApis/calculateReleaseDatesApi'
import contentful from './integration_tests/mockApis/contentful'
import alertsApi from './integration_tests/mockApis/alertsApi'
import componentApi from './integration_tests/mockApis/componentApi'
import personIntegrationApi from './integration_tests/mockApis/personIntegrationApi'
import csipApi from './integration_tests/mockApis/csipApi'
import bookAVideoLinkApi from './integration_tests/mockApis/bookAVideoLinkApi'
import healthAndMedicationApi from './integration_tests/mockApis/healthAndMedication'
import osPlacesApi from './integration_tests/mockApis/osPlacesApi'
import personCommunicationNeedsApi from './integration_tests/mockApis/personCommunicationNeedsApi'
import personalRelationshipsApi from './integration_tests/mockApis/personalRelationshipsApi'

export default defineConfig({
  viewportWidth: 1152,
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  e2e: {
    experimentalRunAllSpecs: true,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...dpsPages,
        ...prisonApi,
        ...locationsInsidePrisonApi,
        ...nomisSyncPrisonerMappingApi,
        ...prisonerSearchApi,
        ...pomApi,
        ...keyWorkerApi,
        ...educationAndWorkPlanApi,
        ...curiousApi,
        ...caseNotesApi,
        ...incentivesMockApi,
        ...pathfinderApi,
        ...socApi,
        ...adjudicationsApi,
        ...nonAssociationsApi,
        ...prisonerProfileDeliusApi,
        ...whereAboutsApi,
        ...complexityApi,
        ...restrictedPatientApi,
        ...prisonRegisterApi,
        ...calcluateReleaseDatesApi,
        ...contentful,
        ...alertsApi,
        ...componentApi,
        ...personIntegrationApi,
        ...csipApi,
        ...bookAVideoLinkApi,
        ...healthAndMedicationApi,
        ...osPlacesApi,
        ...personCommunicationNeedsApi,
        ...personalRelationshipsApi,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
