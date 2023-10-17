import { stubFor } from './wiremock'
import { CellMoveReasonMock } from '../../server/data/localMockData/getCellMoveReasonMock'

export default {
  stubGetCellMoveReason: (bookingId: number) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/2`,
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
