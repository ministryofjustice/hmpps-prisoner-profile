import { differenceInCalendarDays, isBefore, parseISO, startOfToday } from 'date-fns'
import { formatDate } from '../../utils/dateHelpers'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'
import { MiniCardMapper } from '../components/miniCard/miniCardData'
import { CurrentCsra } from '../../data/interfaces/prisonerSearchApi/Prisoner'
import { pluralise } from '../../utils/pluralise'
import config from '../../config'

const csraServiceCard = (currentCsra: CurrentCsra | undefined, prisonerNumber: string) => {
  const dueDate = currentCsra?.reviewDueDate ? parseISO(currentCsra.reviewDueDate) : null
  const today = startOfToday()
  const daysOverdue = dueDate && isBefore(dueDate, today) ? differenceInCalendarDays(today, dueDate) : 0

  const items: { text: string; classes?: string; showWarningIcon?: boolean }[] = [
    { text: currentCsra?.description || 'Not entered' },
  ]

  if (dueDate) {
    items.push({
      text: `Review due by: ${formatDate(currentCsra.reviewDueDate, 'short')}`,
      classes: 'hmpps-secondary-text',
    })
  }

  if (daysOverdue > 0) {
    items.push({
      text: `${pluralise(daysOverdue, 'day')} overdue`,
      classes: 'hmpps-red-text govuk-!-font-weight-bold',
      showWarningIcon: true,
    })
  }

  return {
    id: 'csra',
    heading: 'CSRA',
    items,
    linkHref: `${config.serviceUrls.csraService}/prisoner/${prisonerNumber}`,
    linkLabel: 'CSRA details',
  }
}

const mapper: MiniCardMapper<OverviewPageData['csraSummary'], [boolean, string]> = (
  csraSummary,
  showCsraHistoryLink,
  prisonerNumber,
) => {
  if (config.featureToggles.csraServiceEnabled) {
    return csraServiceCard(csraSummary?.currentCsra, prisonerNumber)
  }

  const { classification, assessmentDate } = csraSummary || {}
  return {
    id: 'csra',
    heading: 'CSRA',
    items: [
      {
        text: classification || 'Not entered',
      },
      ...(assessmentDate
        ? [
            {
              text: `Last review: ${formatDate(assessmentDate, 'short')}`,
              classes: 'hmpps-secondary-text',
            },
          ]
        : []),
    ],
    ...(showCsraHistoryLink
      ? {
          linkHref: `/prisoner/${prisonerNumber}/csra-history`,
          linkLabel: 'CSRA history',
        }
      : {}),
  }
}

export default mapper
