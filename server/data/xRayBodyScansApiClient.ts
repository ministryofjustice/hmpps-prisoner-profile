import type CircuitBreaker from 'opossum'
import config from '../config'
import { formatDateISO } from '../utils/dateHelpers'
import type { PageResponse } from './interfaces/PageResponse'
import type {
  LegacyScanResponse,
  ListScansRequest,
  ScanResponse,
  ScanSummaryRequest,
  ScanSummaryResponse,
  ScanSummaryResponseWithAlerts,
  ScanSummaryResponseWithoutAlerts,
  XRayBodyScansApiClient,
} from './interfaces/xRayBodyScansApi'
import RestClient, { type Request } from './restClient'

interface RawScanResponse extends Omit<ScanResponse, 'scanDate' | 'mergedAt' | 'createdAt' | 'lastModifiedAt'> {
  scanDate: string
  mergedAt: string | null
  createdAt: string
  lastModifiedAt: string
}

interface RawLegacyScanResponse extends Omit<LegacyScanResponse, 'scanDate'> {
  scanDate: string | null
}

interface RawScanSummaryResponse extends Omit<ScanSummaryResponse, 'fromScanDate' | 'toScanDate'> {
  fromScanDate: string
  toScanDate: string
}

export default class XRayBodyScansApiRestClient extends RestClient implements XRayBodyScansApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('X-ray Body Scans API', config.apis.xRayBodyScans, token, circuitBreaker)
  }

  async listScans(
    prisonerNumber: string,
    request?: ListScansRequest,
  ): Promise<PageResponse<ScanResponse | LegacyScanResponse>> {
    const query: object = {
      ...(request ?? {}),
      fromScanDate: request?.fromScanDate ? formatDateISO(request.fromScanDate) : undefined,
      toScanDate: request?.toScanDate ? formatDateISO(request.toScanDate) : undefined,
    }
    const response = await this.get<PageResponse<RawScanResponse | RawLegacyScanResponse>>(
      {
        path: `/prisoner/${encodeURIComponent(prisonerNumber)}/scan`,
        query,
      },
      this.token,
    )
    return {
      ...response,
      content: response.content.map(scan =>
        scan.source === 'NOMIS'
          ? {
              ...scan,
              // using midday in order to avoid daylight saving switches:
              scanDate: scan.scanDate ? new Date(`${scan.scanDate}T12:00:00`) : null,
            }
          : {
              ...scan,
              // using midday in order to avoid daylight saving switches:
              scanDate: new Date(`${scan.scanDate}T12:00:00`),
              mergedAt: scan.mergedAt ? new Date(scan.mergedAt) : null,
              createdAt: new Date(scan.createdAt),
              lastModifiedAt: new Date(scan.lastModifiedAt),
            },
      ),
    }
  }

  async getScanSummary(
    prisonerNumber: string,
    request: ScanSummaryRequest & { includeAlerts: true },
  ): Promise<ScanSummaryResponseWithAlerts>

  async getScanSummary(
    prisonerNumber: string,
    request: ScanSummaryRequest & { includeAlerts?: false },
  ): Promise<ScanSummaryResponseWithoutAlerts>

  async getScanSummary(prisonerNumber: string, request?: ScanSummaryRequest): Promise<ScanSummaryResponse>

  async getScanSummary(prisonerNumber: string, request?: ScanSummaryRequest): Promise<ScanSummaryResponse> {
    const response = await this.get<RawScanSummaryResponse>(
      {
        path: `/prisoner/${encodeURIComponent(prisonerNumber)}/scan/summary`,
        query: request,
      },
      this.token,
    )
    return {
      ...response,
      // using midday in order to avoid daylight saving switches:
      fromScanDate: new Date(`${response.fromScanDate}T12:00:00`),
      toScanDate: new Date(`${response.toScanDate}T12:00:00`),
    }
  }
}
