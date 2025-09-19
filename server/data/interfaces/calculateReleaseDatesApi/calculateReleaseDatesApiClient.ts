import LatestCalculation from './LatestCalculation'

export default interface CalculateReleaseDatesApiClient {
  getLatestCalculation(prisonNumber: string): Promise<LatestCalculation | null>
}
