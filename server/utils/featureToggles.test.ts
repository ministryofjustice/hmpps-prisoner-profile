import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import {
  dietAndAllergyEnabled,
  editProfilePhotoEnabled,
  editProfileSimulateFetch,
  externalContactsEnabled,
} from './featureToggles'

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

      expect(dietAndAllergyEnabled('MDI')).toBeTruthy()
    })

    it('enabled if active case load is listed as enabled after date', () => {
      config.featureToggles.dietAndAllergyEnabledPrisonsByDate = ['MDI']
      config.featureToggles.dietAndAllergyEnabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeTruthy()
    })
  })

  describe('externalContactsEnabled', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.externalContactsEnabledPrisons = []
    })

    it('is not enabled by default', () => {
      expect(externalContactsEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed as enabled', () => {
      config.featureToggles.externalContactsEnabledPrisons = ['LEI']

      expect(externalContactsEnabled('MDI')).toBeFalsy()
    })

    it('enabled if active case load is listed as enabled', () => {
      config.featureToggles.externalContactsEnabledPrisons = ['MDI']

      expect(externalContactsEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard is listed as enabled', () => {
      config.featureToggles.externalContactsEnabledPrisons = ['***']

      expect(externalContactsEnabled('MDI')).toBeTruthy()
    })
  })

  describe('profilePhotoEditEnabled', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.editProfilePhotoEnabledPrisons = []
      config.featureToggles.editProfileEnabledPrisons = []
      config.featureToggles.editProfileEnabled = false
    })

    it('is not enabled by default', () => {
      expect(editProfilePhotoEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed as enabled', () => {
      config.featureToggles.editProfilePhotoEnabledPrisons = ['LEI']

      expect(editProfilePhotoEnabled('MDI')).toBeFalsy()
    })

    it('enabled if active case load is listed as enabled', () => {
      config.featureToggles.editProfilePhotoEnabledPrisons = ['MDI']

      expect(editProfilePhotoEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard is listed as enabled', () => {
      config.featureToggles.editProfilePhotoEnabledPrisons = ['***']

      expect(editProfilePhotoEnabled('MDI')).toBeTruthy()
    })

    it('enabled if profile edit is enabled', () => {
      config.featureToggles.editProfileEnabled = true
      config.featureToggles.editProfileEnabledPrisons = ['MDI']

      expect(editProfilePhotoEnabled('MDI')).toBeTruthy()
    })
  })

  describe('editProfileSimulateFetch', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.editProfileEnabledPrisons = []
      config.featureToggles.editProfileEnabled = false
      config.featureToggles.editProfileSimulateFetch = false
    })

    it('is not enabled by default', () => {
      expect(editProfileSimulateFetch('MDI')).toBeFalsy()
    })

    it('is enabled by config property', () => {
      config.featureToggles.editProfileSimulateFetch = true
      expect(editProfileSimulateFetch('MDI')).toBeTruthy()
    })

    it('is disabled when profile edit is enabled', () => {
      config.featureToggles.editProfileEnabled = true
      config.featureToggles.editProfileEnabledPrisons = ['MDI']
      config.featureToggles.editProfileSimulateFetch = true

      expect(editProfileSimulateFetch('MDI')).toBeFalsy()
    })
  })
})
