import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import {
  dietAndAllergyEnabled,
  editProfileEnabled,
  editProfilePhotoEnabled,
  editProfileSimulateFetch,
  externalContactsEnabled,
} from './featureFlags'

describe('featureToggles', () => {
  describe('editProfileEnabled', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.editProfile.enabledPrisons = []
      config.featureToggles.editProfile.enabledPrisonsByDate = []
      config.featureToggles.editProfile.enabledPrisonsFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(editProfileEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed as permanently enabled', () => {
      config.featureToggles.editProfile.enabledPrisons = ['LEI']

      expect(editProfileEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not enabled by date', () => {
      config.featureToggles.editProfile.enabledPrisonsByDate = ['LEI']
      config.featureToggles.editProfile.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 0))

      expect(editProfileEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime', () => {
      config.featureToggles.editProfile.enabledPrisonsByDate = ['MDI']
      config.featureToggles.editProfile.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(editProfileEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime, even when wildcard used', () => {
      config.featureToggles.editProfile.enabledPrisonsByDate = ['***']
      config.featureToggles.editProfile.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(editProfileEnabled('MDI')).toBeFalsy()
    })

    it('enabled if active case load is listed as permanently enabled', () => {
      config.featureToggles.editProfile.enabledPrisons = ['MDI']

      expect(editProfileEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard used in list of permanently enabled', () => {
      config.featureToggles.editProfile.enabledPrisons = ['***']

      expect(editProfileEnabled('MDI')).toBeTruthy()
    })

    it('enabled if active case load is listed as enabled after date', () => {
      config.featureToggles.editProfile.enabledPrisonsByDate = ['MDI']
      config.featureToggles.editProfile.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(editProfileEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard is listed as enabled after date', () => {
      config.featureToggles.editProfile.enabledPrisonsByDate = ['***']
      config.featureToggles.editProfile.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(editProfileEnabled('MDI')).toBeTruthy()
    })
  })

  describe('dietAndAllergyEnabled', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.dietAndAllergy.enabledPrisons = []
      config.featureToggles.dietAndAllergy.enabledPrisonsByDate = []
      config.featureToggles.dietAndAllergy.enabledPrisonsFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed as permanently enabled', () => {
      config.featureToggles.dietAndAllergy.enabledPrisons = ['LEI']

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not enabled by date', () => {
      config.featureToggles.dietAndAllergy.enabledPrisonsByDate = ['LEI']
      config.featureToggles.dietAndAllergy.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime', () => {
      config.featureToggles.dietAndAllergy.enabledPrisonsByDate = ['MDI']
      config.featureToggles.dietAndAllergy.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime, even when wildcard used', () => {
      config.featureToggles.dietAndAllergy.enabledPrisonsByDate = ['***']
      config.featureToggles.dietAndAllergy.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeFalsy()
    })

    it('enabled if active case load is listed as permanently enabled', () => {
      config.featureToggles.dietAndAllergy.enabledPrisons = ['MDI']

      expect(dietAndAllergyEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard used in list of permanently enabled', () => {
      config.featureToggles.dietAndAllergy.enabledPrisons = ['***']

      expect(dietAndAllergyEnabled('MDI')).toBeTruthy()
    })

    it('enabled if active case load is listed as enabled after date', () => {
      config.featureToggles.dietAndAllergy.enabledPrisonsByDate = ['MDI']
      config.featureToggles.dietAndAllergy.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(dietAndAllergyEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard is listed as enabled after date', () => {
      config.featureToggles.dietAndAllergy.enabledPrisonsByDate = ['***']
      config.featureToggles.dietAndAllergy.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

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
      config.featureToggles.editProfile.enabledPrisons = []
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
      config.featureToggles.editProfile.enabledPrisons = ['MDI']

      expect(editProfilePhotoEnabled('MDI')).toBeTruthy()
    })
  })

  describe('editProfileSimulateFetch', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.editProfile.enabledPrisons = []
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
      config.featureToggles.editProfile.enabledPrisons = ['MDI']
      config.featureToggles.editProfileSimulateFetch = true

      expect(editProfileSimulateFetch('MDI')).toBeFalsy()
    })
  })
})
