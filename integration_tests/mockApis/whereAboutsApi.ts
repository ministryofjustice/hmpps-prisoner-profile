import { stubFor } from './wiremock'
import type { AppointmentDetails } from '../../server/data/interfaces/whereaboutsApi/Appointment'
import { CellMoveReasonMock } from '../../server/data/localMockData/getCellMoveReasonMock'

export default {
  stubGetAppointment: ({ appointment }: { appointment: AppointmentDetails }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/whereabouts/appointment/${appointment.appointment.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointment,
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
