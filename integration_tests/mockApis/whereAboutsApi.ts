import { stubFor } from './wiremock'
import type {
  AppointmentDefaults,
  AppointmentDetails,
  SavedAppointment,
} from '../../server/data/interfaces/whereaboutsApi/Appointment'
import { CellMoveReasonMock } from '../../server/data/localMockData/getCellMoveReasonMock'
import { appointmentMock, savedAppointmentMock } from '../../server/data/localMockData/appointmentMock'

export default {
  stubGetAppointment: ({ response }: { response: AppointmentDetails }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/whereabouts/appointment/${response.appointment.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    })
  },

  stubCreateAppointment: ({
    request = appointmentMock,
    response = [savedAppointmentMock],
  }: {
    request?: AppointmentDefaults
    response?: SavedAppointment[]
  }) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPath: '/whereabouts/appointment',
        bodyPatterns: [{ equalToJson: request }],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    })
  },

  stubGetCellMoveReason: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/whereabouts/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/2`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CellMoveReasonMock,
      },
    })
  },
}
