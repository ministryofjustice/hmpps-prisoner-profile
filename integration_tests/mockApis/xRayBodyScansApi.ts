import { formatISO } from 'date-fns'
import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import type { PageResponse } from '../../server/data/interfaces/PageResponse'
import type { ListScansRequest, ScanResponse, ScanSummaryResponse } from '../../server/data/interfaces/xRayBodyScansApi'

function dateFilters(request: { fromScanDate?: Date; toScanDate?: Date }): Record<string, { equalTo: string }> {
  const queryParameters: Record<string, { equalTo: string }> = {}
  if (request.fromScanDate) {
    queryParameters.fromScanDate = { equalTo: formatISO(request.fromScanDate, { representation: 'date' }) }
  }
  if (request.toScanDate) {
    queryParameters.toScanDate = { equalTo: formatISO(request.toScanDate, { representation: 'date' }) }
  }
  return queryParameters
}

export default {
  stubXRayBodyScanPing: (httpStatus = 200): SuperAgentRequest => stubPing('/xRayBodyScans', httpStatus),

  stubXRayBodyListScans({
    prisonerNumber,
    response,
    request,
  }: {
    prisonerNumber: string
    response: PageResponse<ScanResponse>
    request?: ListScansRequest
  }): SuperAgentRequest {
    const queryParameters = dateFilters(request)
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/xRayBodyScans/prisoner/${prisonerNumber}/scan`,
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          ...response,
          content: response.content.map(scan => ({
            ...scan,
            scanDate: formatISO(scan.scanDate, { representation: 'date' }),
            mergedAt: scan.mergedAt ? formatISO(scan.mergedAt) : null,
            createdAt: formatISO(scan.createdAt),
            lastModifiedAt: formatISO(scan.lastModifiedAt),
          })),
        },
      },
    })
  },

  stubXRayBodyScanSummary({
    prisonerNumber,
    response,
  }: {
    prisonerNumber: string
    response: ScanSummaryResponse
  }): SuperAgentRequest {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/xRayBodyScans/prisoner/${prisonerNumber}/scan/summary`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          ...response,
          fromScanDate: formatISO(response.fromScanDate, { representation: 'date' }),
          toScanDate: formatISO(response.toScanDate, { representation: 'date' }),
        },
      },
    })
  },
}
