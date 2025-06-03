import { isAfter } from 'date-fns'
import config from '../config'

export const editProfileEnabled = (activeCaseLoadId: string) =>
  config.featureToggles.editProfileEnabled && config.featureToggles.editProfileEnabledPrisons.includes(activeCaseLoadId)

export const dietAndAllergyEnabled = (activeCaseLoadId: string) =>
  config.featureToggles.dietAndAllergyEnabledPrisons.includes(activeCaseLoadId) ||
  (isAfter(Date.now(), config.featureToggles.dietAndAllergyEnabledPrisonsFrom) &&
    config.featureToggles.dietAndAllergyEnabledPrisonsByDate.includes(activeCaseLoadId))

export const militaryHistoryEnabled = () =>
  config.featureToggles.militaryHistoryEnabledFrom &&
  isAfter(Date.now(), config.featureToggles.militaryHistoryEnabledFrom)

export const editReligionEnabled = () =>
  config.featureToggles.editReligionEnabledFrom && isAfter(Date.now(), config.featureToggles.editReligionEnabledFrom)

export const externalContactsEnabled = (activeCaseLoadId: string) =>
  config.featureToggles.externalContactsEnabledPrisons.includes(activeCaseLoadId)

export const bvlsMasterPublicPrivateNotesEnabled = () => config.featureToggles.bvlsMasterPublicPrivateNotesEnabled
