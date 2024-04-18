import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'
import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import { formatDate } from '../../utils/dateHelpers'

const formatPrivilegedVisitsSummary = (count: number): string => {
  return `Including ${count} privileged visits`
}
const getPrivilegedVisitsDescription = (remainingPvo: number, remainingVo: number): string => {
  if (remainingPvo) return formatPrivilegedVisitsSummary(remainingPvo)
  if (remainingVo) return 'No privileged visits'
  return ''
}
export default (visitSummary: OverviewPage['visitsSummary'], prisonerNumber: string): MiniSummaryData => {
  const { remainingVo, remainingPvo, startDate } = visitSummary

  return {
    heading: 'Visits',
    topLabel: 'Next visit date',
    topContent: startDate ? formatDate(startDate, 'short') : 'None scheduled',
    topClass: startDate ? 'big' : 'small',
    bottomLabel: 'Remaining visits',
    bottomContentLine1: String(remainingVo) || '0',
    bottomContentLine3: getPrivilegedVisitsDescription(remainingPvo, remainingVo),
    bottomClass: remainingVo ? 'small' : 'big',
    linkLabel: 'Visits details',
    linkHref: `/prisoner/${prisonerNumber}/visits-details`,
  }
}
