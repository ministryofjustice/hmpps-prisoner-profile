import { formatISO } from 'date-fns'
import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import type { PageResponse } from '../../server/data/interfaces/PageResponse'
import { emptyPageResponse } from '../../server/data/localMockData/pageResponse'
import type {
  ErrorResponse,
  LegacyScanResponse,
  ListScansRequest,
  ScanResponse,
  ScanSummaryResponse,
} from '../../server/data/interfaces/xRayBodyScansApi'
import { mockScanSummaryResponse } from '../../server/data/localMockData/xRayBodyScansMock'

function dateFilters(request: { fromScanDate?: Date; toScanDate?: Date }): Record<string, { equalTo: string }> {
  const queryParameters: Record<string, { equalTo: string }> = {}
  if (request?.fromScanDate) {
    queryParameters.fromScanDate = { equalTo: formatISO(request.fromScanDate, { representation: 'date' }) }
  }
  if (request?.toScanDate) {
    queryParameters.toScanDate = { equalTo: formatISO(request.toScanDate, { representation: 'date' }) }
  }
  return queryParameters
}

export default {
  stubXRayBodyScanPing: (httpStatus = 200): SuperAgentRequest => stubPing('/xRayBodyScansApi', httpStatus),

  stubXRayBodyListScans({
    prisonerNumber,
    response = emptyPageResponse(),
    request,
  }: {
    prisonerNumber: string
    response: PageResponse<ScanResponse | LegacyScanResponse> | ErrorResponse
    request?: ListScansRequest
  }): SuperAgentRequest {
    const queryParameters = dateFilters(request)
    const jsonBody: object =
      'content' in response
        ? {
            ...response,
            content: response.content.map(scan =>
              scan.source === 'NOMIS'
                ? {
                    ...scan,
                    scanDate: scan.scanDate ? formatISO(scan.scanDate, { representation: 'date' }) : null,
                  }
                : {
                    ...scan,
                    scanDate: formatISO(scan.scanDate, { representation: 'date' }),
                    mergedAt: scan.mergedAt ? formatISO(scan.mergedAt) : null,
                    createdAt: formatISO(scan.createdAt),
                    lastModifiedAt: formatISO(scan.lastModifiedAt),
                  },
            ),
          }
        : response
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/xRayBodyScansApi/prisoner/${prisonerNumber}/scan`,
        queryParameters,
      },
      response: {
        status: ('status' in response && response.status) || 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody,
      },
    })
  },

  stubXRayBodyScanSummary({
    prisonerNumber,
    response = mockScanSummaryResponse({ prisonerNumber: 'G6123VU' }),
  }: {
    prisonerNumber: string
    response: ScanSummaryResponse | ErrorResponse
  }): SuperAgentRequest {
    const jsonBody: object =
      'fromScanDate' in response
        ? {
            ...response,
            fromScanDate: formatISO(response.fromScanDate, { representation: 'date' }),
            toScanDate: formatISO(response.toScanDate, { representation: 'date' }),
          }
        : response
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/xRayBodyScansApi/prisoner/${prisonerNumber}/scan/summary`,
      },
      response: {
        status: ('status' in response && response.status) || 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody,
      },
    })
  },
}
