import { IncentiveReviewSummary } from '../../interfaces/IncentivesApi/incentiveReviews'

export interface IncentivesApiClient {
  getReviewSummary(bookingId: number, withDetails?: boolean): Promise<IncentiveReviewSummary>
}
