import { Readable } from 'stream'
import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'
import CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { Request } from './restClient'

export interface PrisonerProfileApiClient {
  getWithheldPrisonerPhoto(): Promise<Readable>
}

export default class PrisonerProfileApiRestClient extends RestClient implements PrisonerProfileApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super(
      'Prisoner profile API',
      { url: config.domain, timeout: { response: 5000, deadline: 5000 }, agent: new AgentConfig(5000) },
      token,
      circuitBreaker,
    )
  }

  async getWithheldPrisonerPhoto(): Promise<Readable> {
    return this.stream(
      {
        path: '/assets/images/category-a-prisoner-image.jpg',
      },
      this.token,
    )
  }
}
