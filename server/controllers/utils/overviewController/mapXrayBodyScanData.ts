import config from '../../../config'
import type { ScanSummaryResponse } from '../../../data/interfaces/xRayBodyScansApi'

/** Extended response from xray body scans api for overview page card */
export interface XrayBodyScanSummary extends ScanSummaryResponse {
  // TODO: assuming that anyone can create a recors
  recordScanUrl: string
  viewHistoryUrl: string
}

export function mapXrayBodyScanSummary(summaryResponse: ScanSummaryResponse): XrayBodyScanSummary {
  const urlPrefix = `${config.serviceUrls.xRayBodyScansUi}/prisoner/${summaryResponse.prisonerNumber}`
  return {
    ...summaryResponse,
    recordScanUrl: `${urlPrefix}/create-scan`,
    viewHistoryUrl: `${urlPrefix}/scans`,
  }
}
