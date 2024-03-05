import config from '../config'
import RestClient from './restClient'
import ComplexityApiClient from './interfaces/complexityApi/complexityApiClient'
import ComplexityOfNeed from './interfaces/complexityApi/ComplexityOfNeed'

export default class ComplexityApiRestClient implements ComplexityApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Complexity of Needs API', config.apis.complexityApi, token)
  }

  async getComplexityOfNeed(prisonerNumber: string): Promise<ComplexityOfNeed> {
    return this.restClient.get<ComplexityOfNeed>({
      path: `/v1/complexity-of-need/offender-no/${prisonerNumber}`,
      ignore404: true,
    })
  }
}
