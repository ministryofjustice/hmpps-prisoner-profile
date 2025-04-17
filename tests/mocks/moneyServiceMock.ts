import MoneyService from '../../server/services/moneyService'
import Interface from './Interface'

export const moneyServiceMock = (): Interface<MoneyService> => ({
  getTransactions: jest.fn(),
  getAccountBalances: jest.fn(),
  getAgencyDetails: jest.fn(),
  getDamageObligations: jest.fn(),
})
