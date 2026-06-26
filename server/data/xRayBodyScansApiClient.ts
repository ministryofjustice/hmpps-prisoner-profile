import type CircuitBreaker from 'opossum'
import config from '../config'
import { formatDateISO } from '../utils/dateHelpers'
import type { ScanCountRequest, ScanCountResponse, XRayBodyScansApiClient } from './interfaces/xRayBodyScansApi'
import RestClient, { type Request } from './restClient'

interface RawScanCountResponse extends Omit<ScanCountResponse, 'fromScanDate' | 'toScanDate'> {
  fromScanDate: string
  toScanDate: string
}

export default class XRayBodyScansApiRestClient extends RestClient implements XRayBodyScansApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('X-ray Body Scans API', config.apis.xRayBodyScans, token, circuitBreaker)
  }

  async countScans(request: ScanCountRequest): Promise<ScanCountResponse> {
    const query: Record<string, string> = {}
    if (request.fromScanDate) {
      query.fromScanDate = formatDateISO(request.fromScanDate)
    }
    if (request.toScanDate) {
      query.toScanDate = formatDateISO(request.toScanDate)
    }
    const response = await this.get<RawScanCountResponse>(
      {
        path: `/prisoner/${request.prisonerNumber}/scan/count`,
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
