import { Readable } from 'stream'
import config, { AgentConfig } from '../config'
import RestClient from './restClient'

export interface PrisonerProfileApiClient {
  getWithheldPrisonerPhoto(): Promise<Readable>
}

export default class PrisonerProfileApiRestClient implements PrisonerProfileApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient(
      'Prisoner profile API',
      { url: config.domain, timeout: { response: 5000, deadline: 5000 }, agent: new AgentConfig(5000) },
      token,
    )
  }

  async getWithheldPrisonerPhoto(): Promise<Readable> {
    return this.restClient.stream({
      path: '/assets/images/category-a-prisoner-image.jpg',
    })
  }
}
