import { AppointmentDefaults, AppointmentDetails } from '../interfaces/whereaboutsApi/Appointment'

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

export const vlbAppointmentMock: AppointmentDetails = {
  appointment: {
    id: 1,
    agencyId: 'MDI',
    locationId: 1,
    appointmentTypeCode: 'VLB',
    offenderNo: 'A1234BC',
    startTime: '2023-01-01T12:34:56',
    endTime: '2023-01-01T13:34:56',
    comment: 'Comment',
  },
}

export const vlpmAppointmentMock: AppointmentDetails = {
  appointment: {
    id: 1,
    agencyId: 'MDI',
    locationId: 1,
    appointmentTypeCode: 'VLPM',
    offenderNo: 'A1234BC',
    startTime: '2023-01-01T12:34:56',
    endTime: '2023-01-01T13:34:56',
    comment: 'Comment',
  },
}
