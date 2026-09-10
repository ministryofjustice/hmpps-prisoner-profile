import config from '../../../config'
import type { ScanSummaryResponse } from '../../../data/interfaces/xRayBodyScansApi'

/** Extended response from xray body scans api for overview page card */
export interface XrayBodyScanSummary extends ScanSummaryResponse {
  recordScanUrl: string
  viewHistoryUrl: string
}

export function mapXrayBodyScanSummary(summaryResponse: ScanSummaryResponse): XrayBodyScanSummary {
  const urlPrefix = `${config.serviceUrls.xRayBodyScansUi}/prisoner/${summaryResponse.prisonerNumber}`
  return {
    ...summaryResponse,
    // TODO: make this obey service’s active agencies
    recordScanUrl: `${urlPrefix}/record-scan`,
    viewHistoryUrl: `${urlPrefix}/scan-overview`,
  }
}
