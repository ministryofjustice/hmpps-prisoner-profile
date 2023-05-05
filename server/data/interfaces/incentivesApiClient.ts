import { IncentiveReviews } from '../../interfaces/IncentivesApi/incentiveReviews'

export interface IncentivesApiClient {
  getReviews(bookingId: number): Promise<IncentiveReviews>
}
