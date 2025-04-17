import currentCsipDetailToMiniCardContent from './currentCsipDetailToMiniCardContent'
import { currentCsipDetailMock } from '../../data/localMockData/csipApi/currentCsipDetailMock'
import config from '../../config'
import { Result } from '../../utils/result/result'
import { apiErrorMessage } from '../../utils/utils'
import CurrentCsipDetail from '../../data/interfaces/csipApi/csip'
import { CsipStatus } from '../../data/enums/csipStatus'

describe('currentCsipDetailToMiniCardContent', () => {
  it('should return a mini card detail object', () => {
    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.fulfilled(currentCsipDetailMock), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [
        { text: 'Status: CSIP open' },
        { text: 'Next review date: 01/01/2099', classes: 'hmpps-secondary-text' },
        { text: 'History: 1 CSIP (1 referral)', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })

  it('should return no CSIP history', () => {
    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(
      Result.fulfilled({ ...currentCsipDetailMock, currentCsip: null }),
      prisonerNumber,
    )
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [{ text: 'No CSIP history' }],
    })
  })

  it('should show referral pending', () => {
    const currentCsipDetail: CurrentCsipDetail = {
      currentCsip: {
        status: {
          code: CsipStatus.referralPending,
          description: 'Referral pending',
          listSequence: 0,
        },
        referralDate: '2024-01-01T10:00:00',
        nextReviewDate: '2099-01-01T00:00:00',
      },
      totalOpenedCsipCount: 0,
      totalReferralCount: 0,
    }

    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.fulfilled(currentCsipDetail), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [{ text: 'Status: Referral pending' }, { text: 'No CSIP history', classes: 'hmpps-secondary-text' }],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })

  it('should show referral date', () => {
    const currentCsipDetail: CurrentCsipDetail = {
      currentCsip: {
        status: {
          code: CsipStatus.referralSubmitted,
          description: 'Referral submitted',
          listSequence: 0,
        },
        referralDate: '2024-01-01T10:00:00',
        nextReviewDate: '2099-01-01T00:00:00',
      },
      totalOpenedCsipCount: 0,
      totalReferralCount: 1,
    }

    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.fulfilled(currentCsipDetail), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [
        { text: 'Status: Referral submitted' },
        { text: 'Referral date: 01/01/2024', classes: 'hmpps-secondary-text' },
        { text: 'History: No CSIPs (1 referral)', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })

  it('should show last referral date', () => {
    const currentCsipDetail: CurrentCsipDetail = {
      currentCsip: {
        status: {
          code: CsipStatus.noFurtherAction,
          description: 'No further action',
          listSequence: 0,
        },
        referralDate: '2024-01-01T10:00:00',
        nextReviewDate: '2099-01-01T00:00:00',
      },
      totalOpenedCsipCount: 2,
      totalReferralCount: 2,
    }

    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.fulfilled(currentCsipDetail), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [
        { text: 'Status: No further action' },
        { text: 'Last referral date: 01/01/2024', classes: 'hmpps-secondary-text' },
        { text: 'History: 2 CSIPs (2 referrals)', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })

  it('should show closed date', () => {
    const currentCsipDetail: CurrentCsipDetail = {
      currentCsip: {
        status: {
          code: CsipStatus.csipClosed,
          description: 'CSIP closed',
          listSequence: 0,
        },
        referralDate: '2024-01-01T10:00:00',
        nextReviewDate: '2099-01-01T00:00:00',
        closedDate: '2024-01-01T10:00:00',
      },
      totalOpenedCsipCount: 1,
      totalReferralCount: 1,
    }

    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.fulfilled(currentCsipDetail), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [
        { text: 'Status: CSIP closed' },
        { text: 'Closed date: 01/01/2024', classes: 'hmpps-secondary-text' },
        { text: 'History: 1 CSIP (1 referral)', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })

  it('should show overdue message', () => {
    const currentCsipDetail: CurrentCsipDetail = {
      currentCsip: {
        status: {
          code: CsipStatus.csipOpen,
          description: 'CSIP open',
          listSequence: 0,
        },
        referralDate: '2024-01-01T10:00:00',
        nextReviewDate: '2024-01-01T00:00:00',
        reviewOverdueDays: 2,
      },
      totalOpenedCsipCount: 1,
      totalReferralCount: 1,
    }

    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.fulfilled(currentCsipDetail), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [
        { text: 'Status: CSIP open' },
        { text: 'Next review date: 01/01/2024', classes: 'hmpps-secondary-text' },
        { text: '2 days overdue', classes: 'hmpps-red-text govuk-!-font-weight-bold' },
        { text: 'History: 1 CSIP (1 referral)', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })

  it('should return api error message', () => {
    const prisonerNumber = 'A1234BC'
    const miniCardData = currentCsipDetailToMiniCardContent(Result.rejected(null), prisonerNumber)
    expect(miniCardData).toEqual({
      heading: 'CSIP',
      items: [{ text: apiErrorMessage }],
      linkLabel: 'CSIP details',
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    })
  })
})
