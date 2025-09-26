import IncentiveReviews from './IncentiveReviews'

export interface IncentivesApiClient {
  getReviews(prisonerNumber: string): Promise<IncentiveReviews | null>
}
