import type { PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type { HasNeed } from '../../../data/interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'
import type { XrayBodyScanSummary } from '../../interfaces/OverviewPageData'
import { inmateDetailMock } from '../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA as prisonerMock } from '../../../data/localMockData/prisoner'
import { scheduledTransfersMock } from '../../../data/localMockData/scheduledTransfersMock'
import { mockScanSummaryResponse } from '../../../data/localMockData/xRayBodyScansMock'
import { Result } from '../../../utils/result/result'
import getOverviewStatuses from './getOverviewStatuses'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')
const mockedPrisonerPermissions = {} as PrisonerPermissions

describe('Overview page statuses', () => {
  describe.each([
    { scenario: 'prisoner who is not high-profile or in caseloads', isHighProfilePrisonerOutsideCaseloads: false },
    { scenario: 'high-profile prisoner outside caseloads', isHighProfilePrisonerOutsideCaseloads: true },
  ])('Location of a $scenario', ({ isHighProfilePrisonerOutsideCaseloads }) => {
    it.each([
      {
        scenario: 'prisoner in prison',
        prisoner: { ...prisonerMock, inOutStatus: 'IN' as const },
        expectedLabel: 'In Moorland (HMP & YOI)',
      },
      {
        scenario: 'active out prisoner',
        prisoner: { ...prisonerMock, inOutStatus: 'OUT' as const, status: 'ACTIVE OUT', prisonId: 'OUT' },
        expectedLabel: 'Out from Moorland (HMP & YOI)',
      },
      {
        scenario: 'inactive out prisoner',
        prisoner: {
          ...prisonerMock,
          inOutStatus: 'OUT' as const,
          status: 'INACTIVE OUT',
          prisonId: 'OUT',
          locationDescription: 'Outside - released from Moorland (HMP & YOI)',
        },
        expectedLabel: 'Outside - released from Moorland (HMP & YOI)',
      },
      {
        scenario: 'prisoner in trasnfer',
        prisoner: { ...prisonerMock, inOutStatus: 'TRN' as const, prisonId: 'TRN' },
        expectedLabel: 'Being transferred',
      },
    ])('should show for $scenario', ({ prisoner, expectedLabel }) => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads,
        prisonerData: prisoner,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses[0]).toEqual({ label: expectedLabel })
    })
  })

  describe('Listener status of a prisoner who is not high-profile or in caseloads', () => {
    it('should show for recognised listeners', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: {} as never,
        inmateDetail: {
          ...inmateDetailMock,
          profileInformation: [
            {
              type: 'LIST_REC',
              question: 'Listener - Recognised?',
              resultValue: 'Yes',
            },
          ],
        },
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses[1]).toEqual({ label: 'Recognised listener' })
    })

    it('should show for suitable listeners', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: {} as never,
        inmateDetail: {
          ...inmateDetailMock,
          profileInformation: [
            {
              type: 'LIST_SUIT',
              question: 'Suitable Listener?',
              resultValue: 'Yes',
            },
          ],
        },
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses[1]).toEqual({ label: 'Suitable listener' })
    })

    it('should not show for others', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: {} as never,
        inmateDetail: { ...inmateDetailMock, profileInformation: [] },
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses.some(status => /listener/i.test(status.label))).toBe(false)
    })
  })

  describe('Listener status of a high-profile prisoner outside caseloads', () => {
    it('should not show', () => {
      const inmateDetail = {
        ...inmateDetailMock,
        profileInformation: [
          {
            type: 'LIST_REC',
            question: 'Listener - Recognised?',
            resultValue: 'Yes',
          },
        ],
      }
      Object.defineProperty(inmateDetail, 'profileInformation', {
        get() {
          throw new Error('Should not be accessed')
        },
      })
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: true,
        prisonerData: prisonerMock,
        inmateDetail,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses).toHaveLength(1)
      expect(statuses[0].label).not.toMatch(/listener/i)
    })
  })

  describe('Additional support needs of a prisoner who is not high-profile or in caseloads', () => {
    it('should show a link when a need exists', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.fulfilled({ hasNeed: true, url: '/url', modalUrl: '/modalUrl' }),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      const overviewStatus = statuses.find(status => status.label === 'Additional needs')
      expect(overviewStatus).toEqual({
        label: 'Additional needs',
        subText: 'View support for additional needs',
        subTextHref: '/url',
        style: 'prominent',
      })
    })

    it('should not show when no needs exist', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.fulfilled({ hasNeed: false, url: '/url', modalUrl: '/modalUrl' }),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses.some(status => status.label.includes('Additional needs'))).toBe(false)
    })

    it('should show an error when not loaded', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses.map(status => status.label)).toContain(
        'Additional needs information is currently unavailable. Try again later.',
      )
    })
  })

  describe('Additional support needs of a high-profile prisoner outside caseloads', () => {
    it('should not show', () => {
      const hasNeedsForAdditionalSupport: Result<HasNeed> = Result.rejected(null)
      Object.defineProperty(hasNeedsForAdditionalSupport, 'handle', {
        get() {
          throw new Error('Should not be accessed')
        },
      })
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: true,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport,
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses).toHaveLength(1)
    })
  })

  describe('Scheduled transfers of a prisoner who is not high-profile or in caseloads', () => {
    it('should show next transfer when some exist', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: [{ ...scheduledTransfersMock[0], eventLocation: 'Chapel' }, scheduledTransfersMock[0]],
        xrayBodyScanSummary: Result.rejected(null),
      })
      const overviewStatus = statuses.find(status => status.label === 'Scheduled transfer')
      expect(overviewStatus).toEqual({
        label: 'Scheduled transfer',
        subText: 'To Chapel',
      })
    })

    it('should not show when none scheduled', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: [],
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses.some(status => status.label.includes('Scheduled transfer'))).toBe(false)
    })
  })

  describe('Scheduled transfers of a high-profile prisoner outside caseloads', () => {
    it('should not show', () => {
      const scheduledTransfer = { ...scheduledTransfersMock[0] }
      Object.defineProperty(scheduledTransfer, 'eventLocation', {
        get() {
          throw new Error('Should not be accessed')
        },
      })
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: true,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: [scheduledTransfer],
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses).toHaveLength(1)
    })
  })

  describe('X-ray body scan limit of a prisoner who is not high-profile or in caseloads', () => {
    it('should show a link when limit reached', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.fulfilled({
          ...mockScanSummaryResponse({
            prisonerNumber: prisonerMock.prisonerNumber,
            nomisCount: 20,
            dpsCount: 100,
            positiveCount: 5,
            negativeCount: 100,
            inconclusiveCount: 15,
          }),
          fromScanDate: new Date(2026, 0, 1, 12),
          viewHistoryUrl: '/viewHistoryUrl',
        }),
      })
      const overviewStatus = statuses.find(status => status.label.includes('X-ray'))
      expect(overviewStatus).toEqual({
        label: 'X-ray body scans in 2026',
        subText: 'Scan limit reached',
        subTextHref: '/viewHistoryUrl',
        style: 'warning',
      })
    })

    it('should not show when limit not reached', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.fulfilled({
          ...mockScanSummaryResponse({
            prisonerNumber: prisonerMock.prisonerNumber,
            nomisCount: 2,
            dpsCount: 10,
            negativeCount: 12,
          }),
          fromScanDate: new Date(2026, 0, 1, 12),
          viewHistoryUrl: '/viewHistoryUrl',
        }),
      })
      expect(statuses.some(status => status.label.includes('X-ray'))).toBe(false)
    })

    it('should show an error when not loaded', () => {
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: false,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary: Result.rejected(null),
      })
      expect(statuses.map(status => status.label)).toContain(
        'X-ray body scan limit information is currently unavailable. Try again later.',
      )
    })
  })

  describe('X-ray body scan limit of a high-profile prisoner outside caseloads', () => {
    it('should not show', () => {
      const xrayBodyScanSummary: Result<XrayBodyScanSummary> = Result.rejected(null)
      Object.defineProperty(xrayBodyScanSummary, 'handle', {
        get() {
          throw new Error('Should not be accessed')
        },
      })
      const statuses = getOverviewStatuses({
        prisonerPermissions: mockedPrisonerPermissions,
        isHighProfilePrisonerOutsideCaseloads: true,
        prisonerData: prisonerMock,
        inmateDetail: {} as never,
        hasNeedsForAdditionalSupport: Result.rejected(null),
        scheduledTransfers: null,
        xrayBodyScanSummary,
      })
      expect(statuses).toHaveLength(1)
    })
  })
})
