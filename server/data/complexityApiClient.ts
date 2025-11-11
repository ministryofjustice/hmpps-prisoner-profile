import config from '../config'
import RestClient from './restClient'
import ComplexityApiClient from './interfaces/complexityApi/complexityApiClient'
import ComplexityOfNeed from './interfaces/complexityApi/ComplexityOfNeed'

export default class ComplexityApiRestClient extends RestClient implements ComplexityApiClient {
  constructor(token: string) {
    super('Complexity of Needs API', config.apis.complexityApi, token)
  }

  async getComplexityOfNeed(prisonerNumber: string): Promise<ComplexityOfNeed | null> {
    return this.getAndIgnore404({
      path: `/v1/complexity-of-need/offender-no/${prisonerNumber}`,
    })
  }
}
