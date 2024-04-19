import { formatMoney } from '../../utils/utils'
import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import AccountBalances from '../../data/interfaces/prisonApi/AccountBalances'

export default (moneySummary: AccountBalances, prisonerNumber: string): MiniSummaryData => {
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
