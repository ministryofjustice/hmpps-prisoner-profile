import type { SuperAgentRequest } from 'superagent'
import { stubPing } from './wiremock'

export default {
  stubXRayBodyScanPing: (httpStatus = 200): SuperAgentRequest => stubPing('/xRayBodyScans', httpStatus),
}
