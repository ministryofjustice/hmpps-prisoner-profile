import { formatMoney } from '../../utils/utils'
import { MiniCardMapper } from '../components/miniCard/miniCardData'
import AccountBalances from '../../data/interfaces/prisonApi/AccountBalances'

const mapper: MiniCardMapper<AccountBalances, [string]> = (moneySummary, prisonerNumber) => {
  return {
    heading: 'Money',
    id: 'money',
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

export default mapper
