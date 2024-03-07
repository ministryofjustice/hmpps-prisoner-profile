import IncentiveReviews from './IncentiveReviews'

export interface IncentivesApiClient {
  getReviews(bookingId: number): Promise<IncentiveReviews>
}
