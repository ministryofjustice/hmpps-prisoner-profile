import type CircuitBreaker from 'opossum'
import config from '../config'
import { formatDateISO } from '../utils/dateHelpers'
import type {
  ListScansRequest,
  ScanResponse,
  ScanSummaryRequest,
  ScanSummaryResponse,
  XRayBodyScansApiClient,
} from './interfaces/xRayBodyScansApi'
import RestClient, { type Request } from './restClient'

interface RawScanResponse extends Omit<ScanResponse, 'mergedAt' | 'createdAt' | 'lastModifiedAt'> {
  mergedAt: string | null
  createdAt: string
  lastModifiedAt: string
}

interface RawScanSummaryResponse extends Omit<ScanSummaryResponse, 'fromScanDate' | 'toScanDate'> {
  fromScanDate: string
  toScanDate: string
}

export default class XRayBodyScansApiRestClient extends RestClient implements XRayBodyScansApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('X-ray Body Scans API', config.apis.xRayBodyScans, token, circuitBreaker)
  }

  async listScans(prisonerNumber: string, filters?: ListScansRequest): Promise<ScanResponse[]> {
    const query: Record<string, string | string[] | number> = {
      ...(filters ?? {}),
      fromScanDate: filters.fromScanDate ? formatDateISO(filters.fromScanDate) : undefined,
      toScanDate: filters.toScanDate ? formatDateISO(filters.toScanDate) : undefined,
    }
    const response = await this.get<RawScanResponse[]>(
      {
        path: `/prisoner/${encodeURIComponent(prisonerNumber)}/scan`,
        query,
      },
      this.token,
    )
    return response.map(scan => ({
      ...scan,
      mergedAt: scan.mergedAt ? new Date(scan.mergedAt) : null,
      createdAt: new Date(scan.createdAt),
      lastModifiedAt: new Date(scan.lastModifiedAt),
    }))
  }

  async getScanSummary(request: ScanSummaryRequest): Promise<ScanSummaryResponse> {
    const query: Record<string, string> = {}
    if (request.fromScanDate) {
      query.fromScanDate = formatDateISO(request.fromScanDate)
    }
    if (request.toScanDate) {
      query.toScanDate = formatDateISO(request.toScanDate)
    }
    const response = await this.get<RawScanSummaryResponse>(
      {
        path: `/prisoner/${encodeURIComponent(request.prisonerNumber)}/scan/summary`,
        query,
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
