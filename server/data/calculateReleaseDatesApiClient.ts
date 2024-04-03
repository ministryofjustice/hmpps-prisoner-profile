import CalculateReleaseDatesApiClient from './interfaces/calculateReleaseDatesApi/calculateReleaseDatesApiClient'
import LatestCalculation from './interfaces/calculateReleaseDatesApi/LatestCalculation'
import RestClient from './restClient'
import config from '../config'

export default class calculateReleaseDatesApiClient implements CalculateReleaseDatesApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Calculate Release Dates API', config.apis.calculateReleaseDatesApi, token)
  }

  getLatestCalculation(prisonNumber: string): Promise<LatestCalculation> {
    return this.restClient.get<LatestCalculation>({
      path: `/calculation/${prisonNumber}/latest`,
      ignore404: true,
    })
  }
}
