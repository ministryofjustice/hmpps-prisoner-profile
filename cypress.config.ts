import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import dpsPages from './integration_tests/mockApis/dpsPages'
import prisonApi from './integration_tests/mockApis/prison'
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
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...dpsPages,
        ...prisonApi,
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
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
