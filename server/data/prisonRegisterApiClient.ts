import PrisonRegisterApiClient from './interfaces/prisonRegisterApi/PrisonRegisterApiClient'
import { PrisonDto } from './interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import RestClient from './restClient'
import config from '../config'

/**
 * REST API client implementation of [PrisonRegisterApiClient]
 */
export default class PrisonRegisterApiRestClient implements PrisonRegisterApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Register API', config.apis.prisonRegisterApi, token)
  }

  getPrisonByPrisonId(prisonId: string): Promise<PrisonDto> {
    return this.restClient.get<PrisonDto>({
      path: `/prisons/id/${prisonId}`,
    })
  }

  getAllPrisons(): Promise<Array<PrisonDto>> {
    return this.restClient.get<Array<PrisonDto>>({
      path: '/prisons',
    })
  }
}
