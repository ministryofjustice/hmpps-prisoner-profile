import config from '../config'

export const editProfileEnabled = (activeCaseLoadId: string) =>
  config.featureToggles.editProfileEnabled && config.featureToggles.editProfileEnabledPrisons.includes(activeCaseLoadId)

export const dietAndAllergyEnabled = (activeCaseLoadId: string) =>
  config.featureToggles.dietAndAllergyEnabled &&
  config.featureToggles.dietAndAllergyEnabledPrisons.includes(activeCaseLoadId)

export const militaryHistoryEnabled = () => config.featureToggles.militaryHistoryEnabled
