import PrisonRegisterApiClient from './interfaces/prisonRegisterApi/PrisonRegisterApiClient'
import { PrisonDto } from './interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import RestClient from './restClient'
import config from '../config'

/**
 * REST API client implementation of [PrisonRegisterApiClient]
 */
export default class PrisonRegisterApiRestClient extends RestClient implements PrisonRegisterApiClient {
  constructor(token: string) {
    super('Prison Register API', config.apis.prisonRegisterApi, token)
  }

  getPrisonByPrisonId(prisonId: string): Promise<PrisonDto> {
    return this.get<PrisonDto>(
      {
        path: `/prisons/id/${prisonId}`,
      },
      this.token,
    )
  }

  getAllPrisons(): Promise<Array<PrisonDto>> {
    return this.get<Array<PrisonDto>>(
      {
        path: '/prisons',
      },
      this.token,
    )
  }
}
