import { AccountCode } from '../../enums/accountCode'
import { TransactionPostingType } from '../../enums/transactionPostingType'
import { TransactionPayType } from '../../enums/transactionPayType'

/*
 * Note: all amount values coming from the API are in pence
 */
export default interface Transaction {
  id?: number
  offenderId?: number
  transactionId?: number
  transactionEntrySequence?: number
  entryDate?: string
  calendarDate?: string
  transactionType?: string
  entryDescription?: string
  referenceNumber?: string
  currency?: string
  penceAmount?: number
  accountType?: AccountCode
  postingType?: TransactionPostingType
  offenderNo?: string
  agencyId?: string
  relatedOffenderTransactions?: RelatedTransaction[]
  currentBalance?: number
  holdingCleared?: boolean
  createDateTime?: string
  isBonus?: boolean
  isPieceWork?: boolean
}

export interface RelatedTransaction {
  id: number
  transactionId: number
  transactionEntrySequence: number
  calendarDate: string
  payTypeCode: TransactionPayType
  eventId: number
  payAmount: number
  pieceWork: number
  bonusPay: number
  currentBalance: number
  paymentDescription: string
}
