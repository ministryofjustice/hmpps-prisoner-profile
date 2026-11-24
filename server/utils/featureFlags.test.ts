import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import { editAddressSpecificPhoneNumbersEnabled, offencesMoved } from './featureFlags'

describe('featureToggles', () => {
  describe('editAddressSpecificPhoneNumbersEnabled', () => {
    afterEach(() => {
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisons = []
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisonsByDate = []
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisonsFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(editAddressSpecificPhoneNumbersEnabled('MDI')).toBeFalsy()
    })

    it('is enabled when active case load is listed as permanently enabled', () => {
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisons = ['MDI']

      expect(editAddressSpecificPhoneNumbersEnabled('MDI')).toBeTruthy()
    })

    it('is not enabled when active case load is listed by date but the date has not passed', () => {
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisonsByDate = ['MDI']
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(editAddressSpecificPhoneNumbersEnabled('MDI')).toBeFalsy()
    })

    it('is enabled when active case load is listed by date and the date has passed', () => {
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisonsByDate = ['MDI']
      config.featureToggles.editAddressSpecificPhoneNumbers.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(editAddressSpecificPhoneNumbersEnabled('MDI')).toBeTruthy()
    })
  })

  describe('offencesMoved', () => {
    afterEach(() => {
      config.featureToggles.offencesMoved.enabledPrisons = []
      config.featureToggles.offencesMoved.enabledPrisonsByDate = []
      config.featureToggles.offencesMoved.enabledPrisonsFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled when prison is not listed', () => {
      config.featureToggles.offencesMoved.enabledPrisons = ['LEI']

      expect(offencesMoved('MDI')).toBeFalsy()
    })

    it('is not enabled when prison is listed by date but date has not passed', () => {
      config.featureToggles.offencesMoved.enabledPrisonsByDate = ['MDI']
      config.featureToggles.offencesMoved.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(offencesMoved('MDI')).toBeFalsy()
    })

    it('is not enabled when wildcard used by date but date has not passed', () => {
      config.featureToggles.offencesMoved.enabledPrisonsByDate = ['***']
      config.featureToggles.offencesMoved.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(offencesMoved('MDI')).toBeFalsy()
    })

    it('is enabled when prison is permanently enabled', () => {
      config.featureToggles.offencesMoved.enabledPrisons = ['MDI']

      expect(offencesMoved('MDI')).toBeTruthy()
    })

    it('is enabled when wildcard used in permanently enabled list', () => {
      config.featureToggles.offencesMoved.enabledPrisons = ['***']

      expect(offencesMoved('MDI')).toBeTruthy()
    })

    it('is enabled when prison is listed by date and date has passed', () => {
      config.featureToggles.offencesMoved.enabledPrisonsByDate = ['MDI']
      config.featureToggles.offencesMoved.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(offencesMoved('MDI')).toBeTruthy()
    })

    it('is enabled when wildcard used by date and date has passed', () => {
      config.featureToggles.offencesMoved.enabledPrisonsByDate = ['***']
      config.featureToggles.offencesMoved.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(offencesMoved('MDI')).toBeTruthy()
    })
  })
})
