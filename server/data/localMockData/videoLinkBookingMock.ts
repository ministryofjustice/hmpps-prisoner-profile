import { VideoLinkBookingForm } from '../../interfaces/whereaboutsApi/videoLinkBooking'

// eslint-disable-next-line import/prefer-default-export
export const videoLinkBookingMock: VideoLinkBookingForm = {
  bookingId: 1,
  court: undefined,
  courtId: 'NEWC',
  comment: 'Comment',
  madeByTheCourt: false,
  pre: {
    locationId: 1,
    startTime: '2023-01-01T10:00:00',
    endTime: '2023-01-01T10:15:00',
  },
  main: {
    locationId: 1,
    startTime: '2023-01-01T10:15:00',
    endTime: '2023-01-01T11:15:00',
  },
  post: {
    locationId: 1,
    startTime: '2023-01-01T11:15:00',
    endTime: '2023-01-01T11:30:00',
  },
}
