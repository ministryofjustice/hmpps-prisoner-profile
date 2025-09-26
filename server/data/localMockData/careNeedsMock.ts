import { CareNeed, CareNeedAdjustment, XrayBodyScan } from '../../services/careNeedsService'

export const careNeedAdjustmentMock: CareNeedAdjustment = {
  type: 'ATYPE',
  description: 'Adjustment',
  comment: 'AComment',
  startDate: '2024-06-07',
  endDate: undefined,
  agency: 'Leeds',
}

export const careNeedsMock: CareNeed[] = [
  {
    type: 'TYPE1',
    description: 'Care Need1',
    comment: 'Comment',
    startDate: '2024-06-06',
    endDate: undefined,
    isOngoing: true,
    reasonableAdjustments: [careNeedAdjustmentMock],
  },
  {
    type: 'TYPE2',
    description: 'Care Need2',
    comment: 'Comment',
    startDate: '2024-06-06',
    endDate: '2024-06-01',
    isOngoing: false,
    reasonableAdjustments: [careNeedAdjustmentMock],
  },
]

export const xrayBodyScanCareNeedsMock: CareNeed[] = [
  {
    type: 'BSCAN',
    description: 'Body scan',
    comment: 'Comment',
    startDate: '2024-06-06',
    endDate: undefined,
    isOngoing: true,
    reasonableAdjustments: [careNeedAdjustmentMock],
  },
]

export const xrayBodyScansMock: XrayBodyScan[] = [
  {
    comment: 'Comment',
    scanDate: '2024-06-06',
  },
]
