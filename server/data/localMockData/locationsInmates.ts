import OffenderBooking from '../interfaces/prisonApi/OffenderBooking'

export const mockInmateAtLocation: OffenderBooking = {
  bookingId: 1234134,
  bookingNo: 'A12121',
  offenderNo: 'A1234AA',
  firstName: 'JOHN',
  middleName: 'ASHLEY',
  lastName: 'SMITH',
  dateOfBirth: '1980-05-02',
  age: 32,
  agencyId: 'MDI',
  assignedLivingUnitId: 123123,
  assignedLivingUnitDesc: 'MDI-1-1-3',
  facialImageId: 1241241,
  assignedOfficerUserId: '354543',
  aliases: ['string'],
  categoryCode: 'C',
  convictedStatus: 'Convicted',
  imprisonmentStatus: 'SENT',
  alertsCodes: ['string'],
  alertsDetails: ['string'],
  legalStatus: 'REMAND',
}
