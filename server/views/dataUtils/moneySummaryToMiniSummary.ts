import { formatMoney } from '../../utils/utils'
import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'
import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'

export default (moneySummary: OverviewPage['moneySummary'], prisonerNumber: string): MiniSummaryData => {
  return {
    heading: 'Money',
    topLabel: 'Spends',
    topContent: formatMoney(moneySummary.spends),
    topClass: 'big',
    bottomLabel: 'Private cash',
    bottomContentLine1: formatMoney(moneySummary.cash),
    bottomClass: 'big',
    linkLabel: 'Transactions and savings',
    linkHref: `/prisoner/${prisonerNumber}/money/spends`,
  }
}
