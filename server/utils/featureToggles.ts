import { isAfter } from 'date-fns'
import config from '../config'
import { FeatureFlagMethod } from '../middleware/featureFlagGuard'

export const editProfileEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  config.featureToggles.editProfileEnabled && config.featureToggles.editProfileEnabledPrisons.includes(activeCaseLoadId)

export const editProfilePhotoEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  editProfileEnabled(activeCaseLoadId) ||
  config.featureToggles.editProfilePhotoEnabledPrisons.includes(activeCaseLoadId) ||
  config.featureToggles.editProfilePhotoEnabledPrisons.includes('***')

export const dietAndAllergyEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  config.featureToggles.dietAndAllergyEnabledPrisons.includes(activeCaseLoadId) ||
  (isAfter(Date.now(), config.featureToggles.dietAndAllergyEnabledPrisonsFrom) &&
    config.featureToggles.dietAndAllergyEnabledPrisonsByDate.includes(activeCaseLoadId))

export const militaryHistoryEnabled: FeatureFlagMethod = () => true

export const editReligionEnabled: FeatureFlagMethod = () => true

export const externalContactsEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  config.featureToggles.externalContactsEnabledPrisons.includes('***') ||
  config.featureToggles.externalContactsEnabledPrisons.includes(activeCaseLoadId)
