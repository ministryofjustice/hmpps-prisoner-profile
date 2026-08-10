import config from '../../../config'
import type { PageResponse } from '../../../data/interfaces/PageResponse'
import type { LegacyScanResponse, ScanResponse, ScanSummaryResponse } from '../../../data/interfaces/xRayBodyScansApi'

/** Extended response from xray body scans api for overview page card */
export interface XrayBodyScanSummary extends ScanSummaryResponse {
  // TODO: assuming that anyone can create a records
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

export function mapLatestXrayBodyScan(
  listResponse: PageResponse<ScanResponse | LegacyScanResponse>,
): ScanResponse | LegacyScanResponse | null {
  return listResponse?.content?.[0] ?? null
}
