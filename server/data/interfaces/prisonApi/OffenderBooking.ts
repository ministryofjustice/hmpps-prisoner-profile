export default interface OffenderBooking {
  bookingId: number
  bookingNo?: string
  offenderNo: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  age: number
  agencyId: string
  assignedLivingUnitId?: number
  assignedLivingUnitDesc?: string
  facialImageId?: number
  assignedOfficerUserId?: string
  aliases?: string[]
  categoryCode?: string
  convictedStatus?: string
  imprisonmentStatus?: string
  alertsCodes: string[]
  alertsDetails: string[]
  legalStatus?: string
  establishment?: string
  assignmentEndDateTime?: string
}
