import {
  CaseNotesPermission,
  PersonPrisonCategoryPermission,
  PrisonerBaseLocationPermission,
  PrisonerIncentivesPermission,
  PrisonerPermissions,
  PrisonerSpecificRisksPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import config from '../config'
import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import mockPermissions from '../../tests/mocks/mockPermissions'
import { mapHeaderData, mapProfileBannerTopLinks } from './headerMappers'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')
const mockedPrisonerPermissions = {} as PrisonerPermissions

describe('HeaderMapping', () => {
  describe('Profile banner top links', () => {
    describe('Location', () => {
      it('Displays the location link if permitted', () => {
        mockPermissions({ [PrisonerBaseLocationPermission.read_location_details]: true })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const locationLink = topLinks.find(link => link.heading === 'Location')
        expect(locationLink).toBeDefined()
        expect(locationLink.info).toEqual('1-1-035')
        expect(locationLink.hiddenLabel).toEqual('location')
        expect(locationLink.url).toEqual(`/prisoner/${PrisonerMockDataA.prisonerNumber}/location-details`)
      })

      it('Displays the location link if permitted but the user has active out status', () => {
        mockPermissions({ [PrisonerBaseLocationPermission.read_location_details]: true })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataB,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const locationLink = topLinks.find(link => link.heading === 'Location')
        expect(locationLink).toBeDefined()
        expect(locationLink.info).toEqual('1-1-015 (Outside)')
        expect(locationLink.hiddenLabel).toEqual('location')
        expect(locationLink.url).toEqual(`/prisoner/${PrisonerMockDataB.prisonerNumber}/location-details`)
      })

      it('Hides the the location if not permitted', () => {
        mockPermissions({ [PrisonerBaseLocationPermission.read_location_details]: false })
        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        expect(topLinks.map(link => link.heading)).not.toContain('Location')
      })
    })

    describe('Category', () => {
      it('should not show category data when read permission is not granted', () => {
        mockPermissions({ [PersonPrisonCategoryPermission.read]: false })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        expect(topLinks.map(link => link.heading)).not.toContain('Category')
      })

      it('should show category link if permitted', () => {
        mockPermissions({ [PersonPrisonCategoryPermission.read]: true })
        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const categoryLink = topLinks.find(link => link.heading === 'Category')
        expect(categoryLink).toBeDefined()
        expect(categoryLink.hiddenLabel).toBe('category')
        expect(categoryLink.url).toBe(`${config.serviceUrls.incentives}/${PrisonerMockDataA.bookingId}`)
      })
    })

    describe('CSRA', () => {
      const originalCsraServiceEnabled = config.featureToggles.csraServiceEnabled

      beforeEach(() => {
        config.featureToggles.csraServiceEnabled = false
      })
      afterEach(() => {
        config.featureToggles.csraServiceEnabled = originalCsraServiceEnabled
      })

      it('should not show CSRA data when read permission is not granted', () => {
        mockPermissions({ [PrisonerSpecificRisksPermission.read_csra_rating]: false })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        expect(topLinks.map(link => link.heading)).not.toContain('CSRA')
      })

      it('should show CSRA without a link when only read_csra_rating permission is granted', () => {
        mockPermissions({ [PrisonerSpecificRisksPermission.read_csra_rating]: true })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const csra = topLinks.find(link => link.heading === 'CSRA')
        expect(csra).toBeDefined()
        expect(csra.info).toBe('High')
        expect(csra.url).toBeUndefined()
      })

      it('should show CSRA with a link to view history when both read permissions are granted', () => {
        mockPermissions({
          [PrisonerSpecificRisksPermission.read_csra_rating]: true,
          [PrisonerSpecificRisksPermission.read_csra_assessment_history]: true,
        })
        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const csraLink = topLinks.find(link => link.heading === 'CSRA')
        expect(csraLink).toBeDefined()
        expect(csraLink.info).toBe('High')
        expect(csraLink.hiddenLabel).toBe('CSRA')
        expect(csraLink.url).toBe(`/prisoner/${PrisonerMockDataA.prisonerNumber}/csra-history`)
      })

      describe('when the CSRA service setting is on', () => {
        beforeEach(() => {
          config.featureToggles.csraServiceEnabled = true
        })

        it('should link to the CSRA service only when read_csra_rating permission is granted', () => {
          mockPermissions({ [PrisonerSpecificRisksPermission.read_csra_rating]: true })

          const topLinks = mapProfileBannerTopLinks({
            prisonerData: PrisonerMockDataA,
            inmateDetail: inmateDetailMock,
            prisonerPermissions: mockedPrisonerPermissions,
            isHighProfilePrisonerOutsideCaseloads: false,
          })

          const csraLink = topLinks.find(link => link.heading === 'CSRA')
          expect(csraLink).toBeDefined()
          expect(csraLink.info).toBe('High')
          expect(csraLink.hiddenLabel).toBe('CSRA')
          expect(csraLink.url).toBe(`${config.serviceUrls.csraService}/prisoner/${PrisonerMockDataA.prisonerNumber}`)
        })

        it('should link to the CSRA service, not CSRA history, when both read permissions are granted', () => {
          mockPermissions({
            [PrisonerSpecificRisksPermission.read_csra_rating]: true,
            [PrisonerSpecificRisksPermission.read_csra_assessment_history]: true,
          })

          const topLinks = mapProfileBannerTopLinks({
            prisonerData: PrisonerMockDataA,
            inmateDetail: inmateDetailMock,
            prisonerPermissions: mockedPrisonerPermissions,
            isHighProfilePrisonerOutsideCaseloads: false,
          })

          const csraLink = topLinks.find(link => link.heading === 'CSRA')
          expect(csraLink.url).toBe(`${config.serviceUrls.csraService}/prisoner/${PrisonerMockDataA.prisonerNumber}`)
        })

        it('should not show CSRA data when read permission is not granted', () => {
          mockPermissions({ [PrisonerSpecificRisksPermission.read_csra_rating]: false })

          const topLinks = mapProfileBannerTopLinks({
            prisonerData: PrisonerMockDataA,
            inmateDetail: inmateDetailMock,
            prisonerPermissions: mockedPrisonerPermissions,
            isHighProfilePrisonerOutsideCaseloads: false,
          })

          expect(topLinks.map(link => link.heading)).not.toContain('CSRA')
        })
      })
    })

    describe('Incentive level', () => {
      it('should not show incentive level when read permission is not granted', () => {
        mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level]: false })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        expect(topLinks.map(link => link.heading)).not.toContain('Incentive level')
      })

      it('should show incentive level without history link when only read_incentive_level permission is granted', () => {
        mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level]: true })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const incentiveLink = topLinks.find(link => link.heading === 'Incentive level')
        expect(incentiveLink).toBeDefined()
        expect(incentiveLink.info).toBe('Standard')
        expect(incentiveLink.url).toBeUndefined()
      })

      it('should not show incentive level when high-profile prisoner outside caseloads', () => {
        // TODO: this will become false and test case can be removed
        mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level]: true })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: true,
        })

        expect(topLinks.map(link => link.heading)).not.toContain('Incentive level')
      })

      it('should show incentive level with history link when both read permissions are granted', () => {
        mockPermissions({
          [PrisonerIncentivesPermission.read_incentive_level]: true,
          [PrisonerIncentivesPermission.read_incentive_level_history]: true,
        })

        const topLinks = mapProfileBannerTopLinks({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads: false,
        })

        const incentiveLink = topLinks.find(link => link.heading === 'Incentive level')
        expect(incentiveLink).toBeDefined()
        expect(incentiveLink.info).toBe('Standard')
        expect(incentiveLink.hiddenLabel).toBe('incentive level')
        expect(incentiveLink.url).toBe(
          `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${PrisonerMockDataA.prisonerNumber}`,
        )
      })
    })
  })

  describe('Tab links', () => {
    it.each([
      {
        scenario: 'cannot view case notes',
        canViewCaseNotes: false,
        isHighProfilePrisonerOutsideCaseloads: false,
        expected: [
          { id: 'overview', active: false },
          { id: 'personal', active: false },
          { id: 'alerts', active: true },
          { id: 'offences', active: false },
          { id: 'work-and-skills', active: false },
        ],
      },
      {
        scenario: 'can view case notes',
        canViewCaseNotes: true,
        isHighProfilePrisonerOutsideCaseloads: false,
        expected: [
          { id: 'overview', active: false },
          { id: 'personal', active: false },
          { id: 'case-notes', active: false },
          { id: 'alerts', active: true },
          { id: 'offences', active: false },
          { id: 'work-and-skills', active: false },
        ],
      },
      {
        scenario: 'high-profile prisoner outside caseloads',
        canViewCaseNotes: false,
        isHighProfilePrisonerOutsideCaseloads: true,
        expected: [
          { id: 'overview', active: false },
          { id: 'personal', active: false },
          { id: 'alerts', active: true },
        ],
      },
    ])(
      'should highlight current (alerts) page when $scenario',
      ({ canViewCaseNotes, isHighProfilePrisonerOutsideCaseloads, expected }) => {
        mockPermissions({ [CaseNotesPermission.read]: canViewCaseNotes })

        const { tabLinks } = mapHeaderData({
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          alertSummaryData: { apiUnavailable: true },
          prisonerPermissions: mockedPrisonerPermissions,
          isHighProfilePrisonerOutsideCaseloads,
          pageId: 'alerts',
        })

        expect(tabLinks.map(tab => ({ id: tab.id, active: tab.active }))).toEqual(expected)
      },
    )

    it('should not highlight any page if not current', () => {
      const { tabLinks } = mapHeaderData({
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
        alertSummaryData: { apiUnavailable: true },
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
      })

      expect(tabLinks.values().every(tab => tab.active)).toBe(false)
    })
  })
})
