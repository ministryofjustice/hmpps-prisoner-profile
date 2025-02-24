import config from '../config'
import {
  FieldHistory,
  PrisonPerson,
  PrisonPersonApiClient,
  PrisonPersonHealthUpdate,
} from './interfaces/prisonPersonApi/prisonPersonApiClient'
import RestClient from './restClient'

export default class PrisonPersonApiRestClient implements PrisonPersonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Person API', config.apis.prisonPersonApi, token)
  }

  async updateHealth(prisonerNumber: string, healthData: Partial<PrisonPersonHealthUpdate>): Promise<PrisonPerson> {
    return this.restClient.patch<PrisonPerson>({
      path: `/prisoners/${prisonerNumber}/health`,
      data: healthData,
    })
  }

  async getFieldHistory(prisonerNumber: string, field: string): Promise<FieldHistory[]> {
    return this.restClient.get<FieldHistory[]>({ path: `/prisoners/${prisonerNumber}/field-history/${field}` })
  }
}
