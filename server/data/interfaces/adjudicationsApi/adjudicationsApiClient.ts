import AdjudicationSummary from './AdjudicationsSummary'

export default interface AdjudicationsApiClient {
  getAdjudications(bookingId: number): Promise<AdjudicationSummary>
}
