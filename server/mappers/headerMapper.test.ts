import {
  PersonPrisonCategoryPermission,
  PrisonerBaseLocationPermission,
  PrisonerIncentivesPermission,
  PrisonerPermissions,
  PrisonerSpecificRisksPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { mapProfileBannerTopLinks } from './headerMappers'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import mockPermissions from '../../tests/mocks/mockPermissions'
import config from '../config'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

describe('HeaderMapping', () => {
  describe('Header data', () => {
    describe('Location', () => {
      it('Displays the location link if permitted', () => {
        mockPermissions({ [PrisonerBaseLocationPermission.read_location_details]: true })

        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        const locationLink = topLinks.find(link => link.heading === 'Location')
        expect(locationLink).toBeDefined()
        expect(locationLink.info).toEqual('1-1-035')
        expect(locationLink.url).toEqual(`/prisoner/${PrisonerMockDataA.prisonerNumber}/location-details`)
      })

      it('Displays the location link if permitted but the user has active out status', () => {
        mockPermissions({ [PrisonerBaseLocationPermission.read_location_details]: true })

        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataB, inmateDetailMock, {} as PrisonerPermissions)

        const locationLink = topLinks.find(link => link.heading === 'Location')
        expect(locationLink).toBeDefined()
        expect(locationLink.info).toEqual('1-1-015 (Outside)')
        expect(locationLink.url).toEqual(`/prisoner/${PrisonerMockDataB.prisonerNumber}/location-details`)
      })

      it('Hides the the location if not permitted', () => {
        mockPermissions({ [PrisonerBaseLocationPermission.read_location_details]: false })
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        expect(topLinks.map(link => link.heading)).not.toContain('Location')
      })
    })

    describe('Category', () => {
      it('should not show category data when read permission is not granted', () => {
        mockPermissions({ [PersonPrisonCategoryPermission.read]: false })

        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        expect(topLinks.map(link => link.heading)).not.toContain('Category')
      })

      it('should show category link with "View category" label when only read permission is granted', () => {
        mockPermissions({ [PersonPrisonCategoryPermission.read]: true })
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        const categoryLink = topLinks.find(link => link.heading === 'Category')
        expect(categoryLink).toBeDefined()
        expect(categoryLink.hiddenLabel).toBe('View category')
        expect(categoryLink.url).toBe(`${config.serviceUrls.incentives}/${PrisonerMockDataA.bookingId}`)
      })

      it('should show category link with "Manage category" label when both read and edit permissions are granted', () => {
        mockPermissions({
          [PersonPrisonCategoryPermission.read]: true,
          [PersonPrisonCategoryPermission.edit]: true,
        })

        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        const categoryLink = topLinks.find(link => link.heading === 'Category')
        expect(categoryLink).toBeDefined()
        expect(categoryLink.hiddenLabel).toBe('Manage category')
        expect(categoryLink.url).toBe(`${config.serviceUrls.incentives}/${PrisonerMockDataA.bookingId}`)
      })
    })

    describe('CSRA', () => {
      it('should not show CSRA data when read permission is not granted', () => {
        mockPermissions({ [PrisonerSpecificRisksPermission.read_csra_rating]: false })

        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        expect(topLinks.map(link => link.heading)).not.toContain('CSRA')
      })

      it('should show CSRA without a link when only read_csra_rating permission is granted', () => {
        mockPermissions({ [PrisonerSpecificRisksPermission.read_csra_rating]: true })

        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        const csra = topLinks.find(link => link.heading === 'CSRA')
        expect(csra).toBeDefined()
        expect(csra.info).toBe('High')
        expect(csra.hiddenLabel).toBeUndefined()
        expect(csra.url).toBeUndefined()
      })

      it('should show CSRA with a link to view history when both read permissions are granted', () => {
        mockPermissions({
          [PrisonerSpecificRisksPermission.read_csra_rating]: true,
          [PrisonerSpecificRisksPermission.read_csra_assessment_history]: true,
        })
        const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

        const csraLink = topLinks.find(link => link.heading === 'CSRA')
        expect(csraLink).toBeDefined()
        expect(csraLink.info).toBe('High')
        expect(csraLink.hiddenLabel).toBe('View CSRA history')
        expect(csraLink.url).toBe(`/prisoner/${PrisonerMockDataA.prisonerNumber}/csra-history`)
      })
    })
  })

  describe('Incentive level', () => {
    it('should not show incentive level when read permission is not granted', () => {
      mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level]: false })

      const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

      expect(topLinks.map(link => link.heading)).not.toContain('Incentive level')
    })

    it('should show incentive level without history link when only read_incentive_level permission is granted', () => {
      mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level]: true })

      const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

      const incentiveLink = topLinks.find(link => link.heading === 'Incentive level')
      expect(incentiveLink).toBeDefined()
      expect(incentiveLink.info).toBe('Standard')
      expect(incentiveLink.hiddenLabel).toBeUndefined()
      expect(incentiveLink.url).toBeUndefined()
    })

    it('should show incentive level with history link when both read permissions are granted', () => {
      mockPermissions({
        [PrisonerIncentivesPermission.read_incentive_level]: true,
        [PrisonerIncentivesPermission.read_incentive_level_history]: true,
      })

      const topLinks = mapProfileBannerTopLinks(PrisonerMockDataA, inmateDetailMock, {} as PrisonerPermissions)

      const incentiveLink = topLinks.find(link => link.heading === 'Incentive level')
      expect(incentiveLink).toBeDefined()
      expect(incentiveLink.info).toBe('Standard')
      expect(incentiveLink.hiddenLabel).toBe('View incentive level details')
      expect(incentiveLink.url).toBe(
        `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${PrisonerMockDataA.prisonerNumber}`,
      )
    })
  })
})
