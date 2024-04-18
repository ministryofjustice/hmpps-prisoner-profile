import moneySummaryToMiniSummary from './moneySummaryToMiniSummary'
import AccountBalances from '../../data/interfaces/prisonApi/AccountBalances'

describe('moneySummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const moneySummary: AccountBalances = {
      currency: '',
      damageObligations: 0,
      savings: 0,
      spends: 1.23,
      cash: 7.89,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = moneySummaryToMiniSummary(moneySummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Money',
      topLabel: 'Spends',
      topContent: '£1.23',
      topClass: 'big',
      bottomLabel: 'Private cash',
      bottomContentLine1: '£7.89',
      bottomClass: 'big',
      linkLabel: 'Transactions and savings',
      linkHref: `/prisoner/${prisonerNumber}/money/spends`,
    })
  })
})
