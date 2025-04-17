import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import { dietAndAllergyEnabled } from './featureToggles'

describe('featureToggles', () => {
  describe('dietAndAllergyEnabled', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.dietAndAllergyEnabledPrisons = []
      config.featureToggles.dietAndAllergyEnabledPrisonsByDate = []
      config.featureToggles.dietAndAllergyEnabledPrisonsFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed as permanently enabled', () => {
      config.featureToggles.dietAndAllergyEnabledPrisons = ['LEI']

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not enabled by date', () => {
      config.featureToggles.dietAndAllergyEnabledPrisonsByDate = ['LEI']
      config.featureToggles.dietAndAllergyEnabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime', () => {
      config.featureToggles.dietAndAllergyEnabledPrisonsByDate = ['MDI']
      config.featureToggles.dietAndAllergyEnabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('enabled if active case load is listed as permanently enabled', () => {
      config.featureToggles.dietAndAllergyEnabledPrisons = ['MDI']

      dietAndAllergyEnabled('MDI')
    })

    it('enabled if active case load is listed as enabled after date', () => {
      config.featureToggles.dietAndAllergyEnabledPrisonsByDate = ['MDI']
      config.featureToggles.dietAndAllergyEnabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      dietAndAllergyEnabled('MDI')
    })
  })
})
