import { endOfMonth, isFuture, isSameMonth } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AccountCode } from '../data/enums/accountCode'
import { Transaction } from '../interfaces/prisonApi/transaction'
import { formatDateISO } from '../utils/dateHelpers'
import { AccountBalances } from '../interfaces/accountBalances'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import { TransactionType } from '../data/enums/transactionType'
import { DamageObligation } from '../interfaces/prisonApi/damageObligation'

export default class MoneyService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Handle request for money transactions
   *
   * @param token
   * @param prisonerNumber
   * @param accountCode
   * @param month
   * @param year
   * @param type
   */
  public async getTransactions(
    token: string,
    prisonerNumber: string,
    accountCode: AccountCode,
    month?: number,
    year?: number,
    type?: TransactionType,
  ): Promise<Transaction[]> {
    let params: object = {
      account_code: accountCode,
    }

    if (month !== undefined && year !== undefined) {
      const selectedFromDate = new Date(year, month, 1)
      const today = new Date()

      if (isFuture(selectedFromDate)) return []

      params = {
        ...params,
        from_date: formatDateISO(selectedFromDate),
        to_date: formatDateISO(isSameMonth(today, selectedFromDate) ? today : endOfMonth(selectedFromDate)),
      }
    }

    if (type) {
      params = {
        ...params,
        transaction_type: type,
      }
    }

    return this.prisonApiClientBuilder(token).getTransactionHistory(prisonerNumber, params)
  }

  /**
   * Handle request for account balances
   *
   * @param token
   * @param bookingId
   */
  public async getAccountBalances(token: string, bookingId: number): Promise<AccountBalances> {
    return this.prisonApiClientBuilder(token).getAccountBalances(bookingId)
  }

  /**
   * Handle request for agency details
   *
   * @param token
   * @param agencyId
   */
  public async getAgencyDetails(token: string, agencyId: string): Promise<AgencyLocationDetails> {
    return this.prisonApiClientBuilder(token).getAgencyDetails(agencyId)
  }

  /**
   * Handle request for damage obligations
   *
   * @param token
   * @param prisonerNumber
   */
  public async getDamageObligations(token: string, prisonerNumber: string): Promise<DamageObligation[]> {
    const container = await this.prisonApiClientBuilder(token).getDamageObligations(prisonerNumber)
    return container?.damageObligations || []
  }
}
