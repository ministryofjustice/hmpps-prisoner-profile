import { isAfter } from 'date-fns'
import config from '../config'
import { FeatureFlagMethod } from '../middleware/featureFlagGuard'

interface ScheduledFeatureFlag {
  enabledPrisons: string[]
  enabledPrisonsByDate: string[]
  enabledPrisonsFrom: string
}

const scheduledFeatureFlag =
  (scheduledFeatureFlagConfig: ScheduledFeatureFlag): FeatureFlagMethod =>
  (activeCaseLoadId: string) => {
    const { enabledPrisons, enabledPrisonsByDate, enabledPrisonsFrom } = scheduledFeatureFlagConfig

    return (
      enabledPrisons.includes(activeCaseLoadId) ||
      enabledPrisons.includes('***') ||
      (isAfter(Date.now(), enabledPrisonsFrom) &&
        (enabledPrisonsByDate.includes(activeCaseLoadId) || enabledPrisonsByDate.includes('***')))
    )
  }

export const editProfileSimulateFetch: FeatureFlagMethod = (activeCaseLoadId: string) =>
  config.featureToggles.editProfileSimulateFetch && !editProfileEnabled(activeCaseLoadId)

export const editProfileEnabled: FeatureFlagMethod = scheduledFeatureFlag(config.featureToggles.editProfile)

export const militaryHistoryEnabled: FeatureFlagMethod = () => true

export const editReligionEnabled: FeatureFlagMethod = () => true

export const appInsightsWebAnalyticsEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  config.featureToggles.appInsightsWebAnalyticsEnabledPrisons.includes('***') ||
  config.featureToggles.appInsightsWebAnalyticsEnabledPrisons.includes(activeCaseLoadId)

export const changeContactDetailsLinkEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  editProfileEnabled(activeCaseLoadId) &&
  scheduledFeatureFlag(config.featureToggles.changeContactDetailsLink)(activeCaseLoadId)

export const personDuplicateRecordsEnabled: FeatureFlagMethod = scheduledFeatureFlag(
  config.featureToggles.personDuplicateRecords,
)
