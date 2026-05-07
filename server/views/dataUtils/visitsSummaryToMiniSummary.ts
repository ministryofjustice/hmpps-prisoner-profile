import { MiniCardMapper } from '../components/miniCard/miniCardData'
import { formatDate } from '../../utils/dateHelpers'
import VisitsOverviewSummary from '../../services/interfaces/visitsService/VisitsOverviewSummary'

const formatPrivilegedVisitsSummary = (count: number): string => {
  return `Including ${count} privileged visits`
}
const getPrivilegedVisitsDescription = (remainingPvo: number, remainingVo: number): string => {
  if (remainingPvo) return formatPrivilegedVisitsSummary(remainingPvo)
  if (remainingVo) return 'No privileged visits'
  return ''
}
const mapper: MiniCardMapper<VisitsOverviewSummary, [string]> = (visitSummary, prisonerNumber) => {
  const { remainingVo, remainingPvo, startDate } = visitSummary

  return {
    heading: 'Visits',
    id: 'visits',
    topLabel: 'Next visit date',
    topContent: startDate ? formatDate(startDate, 'short') : 'None scheduled',
    topClass: startDate ? 'big' : 'small',
    bottomLabel: 'Remaining visits',
    bottomContentLine1: remainingVo ? String(remainingVo) : '0',
    bottomContentLine3: getPrivilegedVisitsDescription(remainingPvo, remainingVo),
    bottomClass: 'big',
    linkLabel: 'Visits details',
    linkHref: `/prisoner/${prisonerNumber}/visits-details`,
  }
}

export default mapper
