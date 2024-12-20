import { VideoLinkBooking } from '../interfaces/bookAVideoLinkApi/VideoLinkBooking'

export const videoLinkBookingMock: VideoLinkBooking = {
  videoLinkBookingId: 1,
  statusCode: 'ACTIVE',
  bookingType: 'COURT',
  courtCode: 'ABERCV',
  courtDescription: 'Aberystwyth Civil',
  courtHearingType: 'APPEAL',
  courtHearingTypeDescription: 'Appeal',
  comments: 'Comment',
  videoLinkUrl: 'http://bvls.test.url',
  prisonAppointments: [
    {
      prisonCode: 'MDI',
      prisonLocKey: 'ABC',
      prisonerNumber: 'ABC123',
      appointmentDate: '2023-01-01',
      startTime: '12:34',
      endTime: '13:34',
      appointmentType: 'VLB_COURT_MAIN',
    },
    {
      prisonCode: 'MDI',
      prisonLocKey: 'ABC',
      prisonerNumber: 'ABC123',
      appointmentDate: '2023-01-01',
      startTime: '12:19',
      endTime: '12:34',
      appointmentType: 'VLB_COURT_PRE',
    },
    {
      prisonCode: 'MDI',
      prisonLocKey: 'ABC',
      prisonerNumber: 'ABC123',
      appointmentDate: '2023-01-01',
      startTime: '13:34',
      endTime: '13:49',
      appointmentType: 'VLB_COURT_POST',
    },
  ],
}
