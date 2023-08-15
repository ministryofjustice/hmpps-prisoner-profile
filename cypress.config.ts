import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import dpsHomePage from './integration_tests/mockApis/dpsHomepage'
import dpsOverviewPage from './integration_tests/mockApis/dpsOverviewPage'
import prisonApi from './integration_tests/mockApis/prison'
import prisonerSearchApi from './integration_tests/mockApis/prisonerSearch'
import pomApi from './integration_tests/mockApis/pom'
import keyWorkerApi from './integration_tests/mockApis/keyWorker'
import curiousApi from './integration_tests/mockApis/curiousApi'
import caseNotesApi from './integration_tests/mockApis/caseNotesApi'
import incentivesMockApi from './integration_tests/mockApis/incentivesMockApi'
import pathfinderApi from './integration_tests/mockApis/pathfinderApi'
import socApi from './integration_tests/mockApis/socApi'
import adjudicationsApi from './integration_tests/mockApis/adjudications'

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
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...dpsHomePage,
        ...dpsOverviewPage,
        ...prisonApi,
        ...prisonerSearchApi,
        ...pomApi,
        ...keyWorkerApi,
        ...curiousApi,
        ...caseNotesApi,
        ...incentivesMockApi,
        ...pathfinderApi,
        ...socApi,
        ...adjudicationsApi,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
