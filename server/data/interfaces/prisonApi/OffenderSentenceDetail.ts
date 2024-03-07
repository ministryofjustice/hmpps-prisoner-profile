import SentenceCalcDates from './SentenceCalcDates'

export default interface OffenderSentenceDetail {
  bookingId: number
  offenderNo: string
  firstName: string
  lastName: string
  agencyLocationId: string
  mostRecentActiveBooking: boolean
  sentenceDetail: SentenceCalcDates
  dateOfBirth: string
  agencyLocationDesc: string
  internalLocationDesc?: string
  facialImageId: number
}
