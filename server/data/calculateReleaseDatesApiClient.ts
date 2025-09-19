import CalculateReleaseDatesApiClient from './interfaces/calculateReleaseDatesApi/calculateReleaseDatesApiClient'
import LatestCalculation from './interfaces/calculateReleaseDatesApi/LatestCalculation'
import config from '../config'
import RestClient from './restClient'

export default class calculateReleaseDatesApiClient extends RestClient implements CalculateReleaseDatesApiClient {
  constructor(token: string) {
    super('Calculate Release Dates API', config.apis.calculateReleaseDatesApi, token)
  }

  getLatestCalculation(prisonNumber: string): Promise<LatestCalculation | null> {
    return this.getAndIgnore404({
      path: `/calculation/${prisonNumber}/latest`,
    })
  }
}
