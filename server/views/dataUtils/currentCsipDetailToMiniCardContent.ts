import CurrentCsipDetail from '../../data/interfaces/csipApi/csip'
import { CsipStatus } from '../../data/enums/csipStatus'
import { pluralise } from '../../utils/pluralise'
import { formatDate } from '../../utils/dateHelpers'
import config from '../../config'
import { MiniCardData } from '../components/miniCard/miniCardData'
import { Result } from '../../utils/result/result'
import { apiErrorMessage } from '../../utils/utils'

export default (currentCsipDetail: Result<CurrentCsipDetail>, prisonerNumber: string): MiniCardData => {
  if (currentCsipDetail.status === 'rejected') {
    return {
      heading: 'CSIP',
      items: [
        {
          text: apiErrorMessage,
        },
      ],
      linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
      linkLabel: 'CSIP details',
    }
  }

  const { currentCsip, totalOpenedCsipCount, totalReferralCount } = currentCsipDetail.value
  if (!currentCsip) return { heading: 'CSIP', items: [{ text: 'No CSIP history' }] }

  const { status, referralDate, nextReviewDate, closedDate, reviewOverdueDays } = currentCsip
  const statusCode = status.code as CsipStatus

  const getStatusMessage = (): string => {
    if (
      [
        CsipStatus.referralSubmitted,
        CsipStatus.investigationPending,
        CsipStatus.awaitingDecision,
        CsipStatus.planPending,
      ].includes(statusCode)
    ) {
      return `Referral date: ${formatDate(referralDate, 'short')}`
    }

    if ([CsipStatus.noFurtherAction, CsipStatus.supportOutsideCsip, CsipStatus.acctSupport].includes(statusCode)) {
      return `Last referral date: ${formatDate(referralDate, 'short')}`
    }

    if (statusCode === CsipStatus.csipOpen) {
      return `Next review date: ${formatDate(nextReviewDate, 'short') || 'Not provided'}`
    }

    if (statusCode === CsipStatus.csipClosed) {
      return `Closed date: ${formatDate(closedDate, 'short')}`
    }

    return null // Default if no statusCode matches - either CsipStatus.referralPending or an unknown value
  }

  return {
    heading: 'CSIP',
    items: [
      {
        text: `Status: ${currentCsip.status.description}`,
      },
      ...(getStatusMessage()
        ? [
            {
              text: getStatusMessage(),
              classes: 'hmpps-secondary-text',
            },
          ]
        : []),
      ...(reviewOverdueDays
        ? [
            {
              text: `${pluralise(currentCsip.reviewOverdueDays, 'day')} overdue`,
              classes: 'hmpps-red-text govuk-!-font-weight-bold',
            },
          ]
        : []),
      ...(totalReferralCount || totalOpenedCsipCount
        ? [
            {
              text: `History: ${pluralise(totalOpenedCsipCount, 'CSIP', { emptyMessage: 'No CSIPs' })} (${pluralise(totalReferralCount, 'referral')})`,
              classes: 'hmpps-secondary-text',
            },
          ]
        : []),
      ...(!totalReferralCount && !totalOpenedCsipCount && statusCode === CsipStatus.referralPending
        ? [
            {
              text: 'No CSIP history',
              classes: 'hmpps-secondary-text',
            },
          ]
        : []),
    ],
    linkHref: `${config.serviceUrls.csip}/manage-csips?query=${prisonerNumber}`,
    linkLabel: 'CSIP details',
  }
}
