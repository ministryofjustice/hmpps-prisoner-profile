import { NextFunction, Request, RequestHandler, Response } from 'express'
import { format, parseISO } from 'date-fns'
import { formatMoney, formatName, isEmpty } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { Prisoner } from '../interfaces/prisoner'
import MoneyService from '../services/moneyService'
import { AccountCode } from '../data/enums/accountCode'
import { Transaction } from '../interfaces/prisonApi/transaction'
import { formatDate } from '../utils/dateHelpers'
import { TransactionPostingType } from '../data/enums/transactionPostingType'
import { Agency } from '../interfaces/prisonApi/agency'
import { TransactionType } from '../data/enums/transactionType'
import { DamageObligation } from '../interfaces/prisonApi/damageObligation'
import { AuditService, Page } from '../services/auditService'

/**
 * Parse requests for money routes and orchestrate response
 */
export default class MoneyController {
  constructor(
    private readonly moneyService: MoneyService,
    private readonly auditService: AuditService,
  ) {}

  public displaySpends(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      return this.getTransactions(AccountCode.Spends, 'Spends', Page.MoneySpends, req, res)
    }
  }

  public displayPrivateCash(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      return this.getTransactions(AccountCode.PrivateCash, 'Private cash', Page.MoneyPrivateCash, req, res)
    }
  }

  public displaySavings(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      return this.getTransactions(AccountCode.Savings, 'Savings', Page.MoneySavings, req, res)
    }
  }

  public displayDamageObligations(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      return this.getDamageObligations(req, res)
    }
  }

  private async getDamageObligations(req: Request, res: Response) {
    const { prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = res.locals

    const [accountBalances, damageObligations] = await Promise.all([
      this.moneyService.getAccountBalances(clientToken, bookingId),
      this.moneyService.getDamageObligations(clientToken, prisonerNumber),
    ])
    damageObligations.sort((a, b) => parseISO(b.startDateTime).getTime() - parseISO(a.startDateTime).getTime())

    const uniquePrisonIds = [...new Set(damageObligations.map(obligation => obligation.prisonId))]
    const prisons = await Promise.all(uniquePrisonIds.map(id => this.moneyService.getAgencyDetails(clientToken, id)))

    await this.auditService.sendPageView({
      userId: res.locals.user.username,
      userCaseLoads: res.locals.user.caseLoads,
      userRoles: res.locals.user.userRoles,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.MoneyDamageObligations,
    })

    return res.render('pages/money/damageObligations', {
      pageTitle: 'Damage obligations',
      showDamageObligationsTab: true,
      ...this.getRefData(req.middleware.prisonerData),
      currentlyOwes: accountBalances[AccountCode.DamageObligations],
      obligations: this.mapToObligationTableRows(damageObligations, prisons),
    })
  }

  private async getTransactions(
    accountCode: AccountCode,
    accountDescription: string,
    auditPage: Page,
    req: Request,
    res: Response,
  ) {
    const now = new Date()
    const month: number = req.query.month === undefined ? now.getMonth() : +req.query.month
    const year: number = +req.query.year || now.getFullYear()
    const { prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = res.locals
    const isPrivateCash = accountCode === AccountCode.PrivateCash

    const [accountBalances, allTransactions, addHoldFunds, withheldFunds] = await Promise.all([
      this.moneyService.getAccountBalances(clientToken, bookingId),
      this.moneyService.getTransactions(clientToken, prisonerNumber, accountCode, month, year),
      isPrivateCash
        ? this.moneyService.getTransactions(
            clientToken,
            prisonerNumber,
            accountCode,
            null,
            null,
            TransactionType.AddHold,
          )
        : [],
      isPrivateCash
        ? this.moneyService.getTransactions(
            clientToken,
            prisonerNumber,
            accountCode,
            null,
            null,
            TransactionType.Withheld,
          )
        : [],
    ])

    const pendingTransactions = [...addHoldFunds, ...withheldFunds]
      .filter(transaction => !transaction.holdingCleared)
      .sort(this.transactionSort)
    const pendingBalance = pendingTransactions.reduce((result, current) => current.penceAmount + result, 0)

    const uniqueAgencyIds = [
      ...new Set([...allTransactions, ...pendingTransactions].map(transaction => transaction.agencyId)),
    ]
    const prisons = await Promise.all(
      uniqueAgencyIds.map(agencyId => this.moneyService.getAgencyDetails(clientToken, agencyId)),
    )

    const bonusPayTransactions: Transaction[] = []
    const pieceWorkTransactions: Transaction[] = []

    const batchTransactions: Transaction[] = allTransactions
      .filter(transaction => transaction.relatedOffenderTransactions?.length)
      .flatMap(batchTransaction => {
        return batchTransaction.relatedOffenderTransactions.map(relatedTransaction => {
          // Account for bonusPay and pieceWork by adding a new transaction with desc "Bonus for <entryDescription>"
          // or "Piece work for <entryDescription>"
          if (relatedTransaction.bonusPay) {
            bonusPayTransactions.push({
              id: relatedTransaction.id,
              entryDate: batchTransaction.entryDate,
              calendarDate: relatedTransaction.calendarDate,
              agencyId: batchTransaction.agencyId,
              penceAmount: relatedTransaction.bonusPay,
              currentBalance:
                batchTransaction.currentBalance - batchTransaction.penceAmount + relatedTransaction.bonusPay,
              entryDescription: `Bonus pay for ${relatedTransaction.paymentDescription} from ${formatDate(
                relatedTransaction.calendarDate,
                'short',
              )}`,
              postingType: TransactionPostingType.Credit,
              isBonus: true,
            })
          }

          if (relatedTransaction.pieceWork) {
            pieceWorkTransactions.push({
              id: relatedTransaction.id,
              entryDate: batchTransaction.entryDate,
              calendarDate: relatedTransaction.calendarDate,
              agencyId: batchTransaction.agencyId,
              penceAmount: relatedTransaction.pieceWork,
              currentBalance:
                batchTransaction.currentBalance - batchTransaction.penceAmount + relatedTransaction.pieceWork,
              entryDescription: `Piece work for ${relatedTransaction.paymentDescription} from ${formatDate(
                relatedTransaction.calendarDate,
                'short',
              )}`,
              postingType: TransactionPostingType.Credit,
              isPieceWork: true,
            })
          }

          return {
            id: relatedTransaction.id,
            entryDate: batchTransaction.entryDate,
            calendarDate: relatedTransaction.calendarDate,
            agencyId: batchTransaction.agencyId,
            penceAmount: relatedTransaction.payAmount,
            currentBalance: relatedTransaction.currentBalance,
            entryDescription: `${relatedTransaction.paymentDescription} from ${formatDate(
              relatedTransaction.calendarDate,
              'short',
            )}`,
            postingType: TransactionPostingType.Credit,
          }
        })
      })
    const nonBatchTransactions = allTransactions.filter(transaction => isEmpty(transaction.relatedOffenderTransactions))

    const transactions = [
      ...nonBatchTransactions,
      ...batchTransactions,
      ...bonusPayTransactions,
      ...pieceWorkTransactions,
    ]
      .filter(transaction => transaction.penceAmount)
      .sort(this.transactionSort)

    await this.auditService.sendPageView({
      userId: res.locals.user.username,
      userCaseLoads: res.locals.user.caseLoads,
      userRoles: res.locals.user.userRoles,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: auditPage,
    })

    return res.render('pages/money/transactions', {
      pageTitle: `${accountDescription} account`,
      showDamageObligationsTab: !!accountBalances.damageObligations,
      ...this.getRefData(req.middleware.prisonerData),
      currentBalance: accountBalances[accountCode],
      pendingBalance,
      formValues: {
        month,
        year,
      },
      period: format(new Date(year, month), 'MMMM yyyy'),
      transactions: this.mapToTableRows(transactions, prisons),
      pendingTransactions: this.mapToPendingTableRows(pendingTransactions, prisons),
    })
  }

  private getRefData(prisonerData: Prisoner) {
    const { firstName, middleNames, lastName, prisonerNumber } = prisonerData
    const breadcrumbPrisonerName = formatName(firstName, middleNames, lastName, {
      style: NameFormatStyle.lastCommaFirst,
    })
    const prisonerName = formatName(firstName, middleNames, lastName, {
      style: NameFormatStyle.firstLast,
    })

    return {
      breadcrumbPrisonerName,
      prisonerName,
      prisonerNumber,
      months: [
        { text: 'January', value: 0 },
        { text: 'February', value: 1 },
        { text: 'March', value: 2 },
        { text: 'April', value: 3 },
        { text: 'May', value: 4 },
        { text: 'June', value: 5 },
        { text: 'July', value: 6 },
        { text: 'August', value: 7 },
        { text: 'September', value: 8 },
        { text: 'October', value: 9 },
        { text: 'November', value: 10 },
        { text: 'December', value: 11 },
      ],
      years: this.getLast4Years(),
    }
  }

  private getLast4Years() {
    const currentYear = new Date().getFullYear()
    const numberOfYears = 4
    return Array.from({ length: numberOfYears }, (_, i) => i + currentYear - numberOfYears + 1)
      .map(year => ({ text: year, value: year }))
      .reverse()
  }

  private mapToTableRows(transactions: Transaction[], prisons: Agency[]): object[] {
    return transactions.map(t => {
      return [
        { text: formatDate(t.entryDate, 'short') },
        {
          text: t.postingType === TransactionPostingType.Credit ? formatMoney(t.penceAmount, { usePence: true }) : '',
          format: 'numeric',
        },
        {
          text: t.postingType === TransactionPostingType.Debit ? formatMoney(-t.penceAmount, { usePence: true }) : '',
          format: 'numeric',
        },
        { text: formatMoney(t.currentBalance, { usePence: true }), format: 'numeric' },
        { text: t.entryDescription },
        { text: prisons.find(prison => prison.agencyId === t.agencyId)?.description || t.agencyId },
      ]
    })
  }

  private mapToPendingTableRows(transactions: Transaction[], prisons: Agency[]): object[] {
    return transactions.map(t => {
      return [
        { text: formatDate(t.entryDate, 'short') },
        {
          text: formatMoney(t.penceAmount, { usePence: true }),
          format: 'numeric',
        },
        { text: t.entryDescription },
        { text: prisons.find(prison => prison.agencyId === t.agencyId)?.description || t.agencyId },
      ]
    })
  }

  private mapToObligationTableRows(obligations: DamageObligation[], prisons: Agency[]): object[] {
    return obligations.map(t => {
      const location = prisons.find(prison => prison.agencyId === t.prisonId)?.description || t.prisonId

      return [
        { text: t.id },
        { text: t.referenceNumber },
        { text: `${formatDate(t.startDateTime, 'short')} to ${formatDate(t.endDateTime, 'short')}` },
        {
          text: formatMoney(t.amountToPay),
          format: 'numeric',
        },
        {
          text: formatMoney(t.amountPaid),
          format: 'numeric',
        },
        {
          text: formatMoney(t.amountToPay - t.amountPaid),
          format: 'numeric',
        },
        { text: t.comment ? `${location} - ${t.comment}` : location },
      ]
    })
  }

  /**
   * Sort transactions by Entry Date, Calendar Date - In reverse order
   *
   * If a transaction is a bonus or piece work, it must be earliest within the same set of entry dates
   *
   * @param a
   * @param b
   * @private
   */
  private transactionSort(a: Transaction, b: Transaction) {
    const entryDateDiff = parseISO(b.entryDate).getTime() - parseISO(a.entryDate).getTime()
    if (entryDateDiff !== 0) return entryDateDiff

    if (a.isBonus || a.isPieceWork) return 1
    if (b.isBonus || b.isPieceWork) return -1

    if (a.calendarDate && b.calendarDate) {
      const calendarDateDiff = parseISO(b.calendarDate).getTime() - parseISO(a.calendarDate).getTime()
      if (calendarDateDiff !== 0) return calendarDateDiff
    }

    if (a.id && b.id) return b.id - a.id

    return 0
  }
}
