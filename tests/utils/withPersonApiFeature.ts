import config from '../../server/config'

/** When all “use person API / CPR” feature flags are disabled */
export function withoutPersonApi(testCases: () => void) {
  describe('Before using Person API for any core person record details', () => {
    beforeEach(() => {
      config.featureToggles.usePersonApi = Object.fromEntries(
        Object.keys(config.featureToggles.usePersonApi).map(domain => [domain, false]),
      ) as typeof config.featureToggles.usePersonApi
    })

    testCases()
  })
}

/** When all “use person API / CPR” feature flags are enabled */
export function withPersonApi(tests: () => void) {
  describe('When using Person API for all core person record details', () => {
    beforeEach(() => {
      config.featureToggles.usePersonApi = Object.fromEntries(
        Object.keys(config.featureToggles.usePersonApi).map(domain => [domain, true]),
      ) as typeof config.featureToggles.usePersonApi
    })

    tests()
  })
}
