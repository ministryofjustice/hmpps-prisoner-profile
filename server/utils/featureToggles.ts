import config from '../config'

export const enablePrisonPerson = (activeCaseLoadId: string) =>
  config.featureToggles.prisonPersonApiEnabled &&
  config.featureToggles.prisonPersonApiEnabledPrisons.includes(activeCaseLoadId)

export const dietAndAllergyEnabled = (activeCaseLoadId: string) =>
  config.featureToggles.dietAndAllergyEnabled &&
  config.featureToggles.dietAndAllergyEnabledPrisons.includes(activeCaseLoadId)

export const militaryHistoryEnabled = () => config.featureToggles.militaryHistoryEnabled
