import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import type { ScanCountResponse } from '../../server/data/interfaces/xRayBodyScansApi'

export default {
  stubXRayBodyScanPing: (httpStatus = 200): SuperAgentRequest => stubPing('/xRayBodyScans', httpStatus),

  stubXRayBodyScanCounts({
    response,
    fromScanDate,
    toScanDate,
  }: {
    response: ScanCountResponse
    /** date filter query string: need not match response’s range and usually not provided */
    fromScanDate?: Date
    /** date filter query string: need not match response’s range and usually not provided */
    toScanDate?: Date
  }): SuperAgentRequest {
    const queryParameters: Record<string, { equalTo: string }> = {}
    if (fromScanDate) {
      queryParameters.fromScanDate = { equalTo: fromScanDate.toISOString().split('T')[0] }
    }
    if (toScanDate) {
      queryParameters.fromScanDate = { equalTo: toScanDate.toISOString().split('T')[0] }
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/xRayBodyScans/prisoner/${response.prisonerNumber}/scan/count`,
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          ...response,
          fromScanDate: response.fromScanDate.toISOString().split('T')[0],
          toScanDate: response.toScanDate.toISOString().split('T')[0],
        },
      },
    })
  },
}
