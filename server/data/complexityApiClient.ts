import config from '../config'
import RestClient from './restClient'
import { ComplexityOfNeed } from '../interfaces/complexityApi/complexityOfNeed'
import { ComplexityApiClient } from './interfaces/complexityApiClient'

export default class ComplexityApiRestClient implements ComplexityApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Complexity of Needs API', config.apis.complexityApi, token)
  }

  async getComplexityOfNeed(prisonerNumber: string): Promise<ComplexityOfNeed> {
    return this.restClient.get<ComplexityOfNeed>({
      path: `/complexity-of-need/offender-no/${prisonerNumber}`,
      ignore404: true,
    })
  }
}
