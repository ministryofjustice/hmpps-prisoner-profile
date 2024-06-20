import config from '../config'

export const enablePrisonPerson = (activeCaseLoadId: string) =>
  config.featureToggles.prisonPersonApiEnabled &&
  config.featureToggles.prisonPersonApiEnabledPrisons.includes(activeCaseLoadId)
