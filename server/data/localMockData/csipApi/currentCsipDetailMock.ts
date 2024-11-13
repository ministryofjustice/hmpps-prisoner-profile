import CurrentCsipDetail from '../../interfaces/csipApi/csip'
import { CsipStatus } from '../../enums/csipStatus'

export const currentCsipDetailMock: CurrentCsipDetail = {
  currentCsip: {
    status: {
      code: CsipStatus.csipOpen,
      description: 'CSIP open',
      listSequence: 0,
    },
    referralDate: '2024-01-01T10:00:00',
    nextReviewDate: '2099-01-01T00:00:00',
  },
  totalOpenedCsipCount: 1,
  totalReferralCount: 1,
}
