import { stubFor } from './wiremock'
import { getCellMoveReasonTypesMock } from '../../server/data/localMockData/getCellMoveReasonTypesMock'

export default {
  stubGetCellMoveReason: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/123`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: getCellMoveReasonTypesMock,
      },
    })
  },
}
