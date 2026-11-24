import { isAfter } from 'date-fns'
import config from '../config'
import type { FeatureFlagMethod } from '../middleware/featureFlagGuard'

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

export const editAddressSpecificPhoneNumbersEnabled: FeatureFlagMethod = scheduledFeatureFlag(
  config.featureToggles.editAddressSpecificPhoneNumbers,
)

export const militaryHistoryEnabled: FeatureFlagMethod = () => true

export const appInsightsWebAnalyticsEnabled: FeatureFlagMethod = (activeCaseLoadId: string) =>
  config.featureToggles.appInsightsWebAnalyticsEnabledPrisons.includes('***') ||
  config.featureToggles.appInsightsWebAnalyticsEnabledPrisons.includes(activeCaseLoadId)

export const personDuplicateRecordsEnabled: FeatureFlagMethod = scheduledFeatureFlag(
  config.featureToggles.personDuplicateRecords,
)

export const offencesMoved: FeatureFlagMethod = scheduledFeatureFlag(config.featureToggles.offencesMoved)

export const propertySummaryTileEnabled: FeatureFlagMethod = () => config.featureToggles.propertySummaryTileEnabled
