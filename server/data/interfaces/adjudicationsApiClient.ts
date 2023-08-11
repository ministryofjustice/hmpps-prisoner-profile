import { AdjudicationSummary } from '../../interfaces/adjudicationSummary'

export interface AdjudicationsApiClient {
  getAdjudications(bookingId: number): Promise<AdjudicationSummary>
}
