import CircuitBreaker from 'opossum'
import PrisonRegisterApiClient from './interfaces/prisonRegisterApi/PrisonRegisterApiClient'
import { PrisonDto } from './interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import RestClient, { Request } from './restClient'
import config from '../config'

/**
 * REST API client implementation of [PrisonRegisterApiClient]
 */
export default class PrisonRegisterApiRestClient extends RestClient implements PrisonRegisterApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Prison Register API', config.apis.prisonRegisterApi, token, circuitBreaker)
  }

  getPrisonByPrisonId(prisonId: string): Promise<PrisonDto> {
    return this.get(
      {
        path: `/prisons/id/${prisonId}`,
      },
      this.token,
    )
  }

  getAllPrisons(): Promise<PrisonDto[]> {
    return this.get(
      {
        path: '/prisons',
      },
      this.token,
    )
  }
}
