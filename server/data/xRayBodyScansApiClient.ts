import type CircuitBreaker from 'opossum'
import config from '../config'
import { formatDateISO } from '../utils/dateHelpers'
import type { ScanCountRequest, ScanCountResponse, XRayBodyScansApiClient } from './interfaces/xRayBodyScansApi'
import RestClient, { type Request } from './restClient'

export default class XRayBodyScansApiRestClient extends RestClient implements XRayBodyScansApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('X-ray Body Scans API', config.apis.xRayBodyScans, token, circuitBreaker)
  }

  countScans(request: ScanCountRequest): Promise<ScanCountResponse> {
    const query: Record<string, string> = {}
    if (request.fromScanDate) {
      query.fromScanDate = formatDateISO(request.fromScanDate)
    }
    if (request.toScanDate) {
      query.toScanDate = formatDateISO(request.toScanDate)
    }
    return this.get(
      {
        path: `/prisoner/${request.prisonerNumber}/scan/count`,
        query,
      },
      this.token,
    )
  }
}
