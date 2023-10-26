import { AppointmentDefaults } from '../../interfaces/whereaboutsApi/appointment'

// eslint-disable-next-line import/prefer-default-export
export const appointmentMock: AppointmentDefaults = {
  bookingId: 1,
  locationId: 1,
  appointmentType: 'CANT',
  comment: 'Comment',
  startTime: '2023-01-01T12:34:56',
  endTime: '2023-01-01T13:34:56',
  repeat: {
    repeatPeriod: 'WEEKLY',
    count: 1,
  },
}
