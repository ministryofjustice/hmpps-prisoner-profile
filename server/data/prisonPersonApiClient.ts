import config from '../config'
import {
  PrisonPerson,
  PrisonPersonApiClient,
  PrisonPersonPhysicalAttributes,
  PrisonPersonPhysicalCharacteristics,
} from './interfaces/prisonPersonApi/prisonPersonApiClient'
import RestClient from './restClient'

export default class PrisonPersonApiRestClient implements PrisonPersonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Person API', config.apis.prisonPersonApi, token)
  }

  async getPrisonPerson(prisonerNumber: string): Promise<PrisonPerson> {
    return this.restClient.get<PrisonPerson>({ path: `/prisoners/${prisonerNumber}`, ignore404: true })
  }

  // PUT endpoints

  async updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: Partial<PrisonPersonPhysicalAttributes>,
  ): Promise<PrisonPersonPhysicalAttributes> {
    return this.restClient.put<PrisonPersonPhysicalAttributes>({
      path: `/prisoners/${prisonerNumber}/physical-attributes`,
      data: physicalAttributes,
    })
  }

  async updatePhysicalCharacteristics(
    prisonerNumber: string,
    physicalCharacteristics: Partial<PrisonPersonPhysicalCharacteristics>,
  ): Promise<PrisonPersonPhysicalCharacteristics> {
    return this.restClient.put<PrisonPersonPhysicalCharacteristics>({
      path: `/prisoners/${prisonerNumber}/physical-characteristics`,
      data: physicalCharacteristics,
    })
  }
}
