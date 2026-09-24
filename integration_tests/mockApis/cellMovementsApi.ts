import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import { CellMovementReasonMock } from '../../server/data/localMockData/cellMovementReasonMock'

export default {
  stubCellMovementsApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/cellMovementsApi', httpStatus),

  stubGetCellMovementReason: (bookingId: number): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/cellMovementsApi/cell-movements/${bookingId}/bed-assignment/2`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { ...CellMovementReasonMock, bookingId, bedAssignmentSequence: 2 },
      },
    })
  },
}
