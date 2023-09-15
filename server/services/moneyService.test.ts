import { Prisoner } from '../interfaces/prisoner'
import MoneyService from './moneyService'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { transactionsMock } from '../data/localMockData/transactionsMock'
import { accountBalancesMock } from '../data/localMockData/miniSummaryMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { damageObligationContainerMock } from '../data/localMockData/damageObligationsMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { AccountCode } from '../data/enums/accountCode'

jest.mock('../data/prisonApiClient')

describe('Money Pages', () => {
  let prisonerData: Prisoner
  let moneyService: MoneyService
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisonerData = PrisonerMockDataA
    prisonApiClient = {
      ...prisonApiClientMock(),
      getTransactionHistory: jest.fn(async () => transactionsMock),
      getAccountBalances: jest.fn(async () => accountBalancesMock),
      getAgencyDetails: jest.fn(async () => AgenciesMock),
      getDamageObligations: jest.fn(async () => damageObligationContainerMock),
    }
    moneyService = new MoneyService(() => prisonApiClient)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Transactions', () => {
    it('should call Prison API to get transactions', async () => {
      await moneyService.getTransactions('TOKEN', prisonerData.prisonerNumber, AccountCode.Spends, 0, 2023, undefined)

      expect(prisonApiClient.getTransactionHistory).toHaveBeenCalledWith(prisonerData.prisonerNumber, {
        account_code: AccountCode.Spends,
        from_date: '2023-01-01',
        to_date: '2023-01-31',
      })
    })
  })

  describe('Get Account Balances', () => {
    it('should call Prison API to get account balances', async () => {
      await moneyService.getAccountBalances('TOKEN', prisonerData.bookingId)

      expect(prisonApiClient.getAccountBalances).toHaveBeenCalledWith(prisonerData.bookingId)
    })
  })

  describe('Get Agency Details', () => {
    it('should call Prison API to get agency details', async () => {
      await moneyService.getAgencyDetails('TOKEN', prisonerData.prisonId)

      expect(prisonApiClient.getAgencyDetails).toHaveBeenCalledWith(prisonerData.prisonId)
    })
  })

  describe('Get Damage Obligations', () => {
    it('should call Prison API to get damage obligations', async () => {
      await moneyService.getDamageObligations('TOKEN', prisonerData.prisonerNumber)

      expect(prisonApiClient.getDamageObligations).toHaveBeenCalledWith(prisonerData.prisonerNumber)
    })
  })
})
